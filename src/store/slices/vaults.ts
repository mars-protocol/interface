import BigNumber from 'bignumber.js'
import { findByDenom, iterateContractQuery } from 'functions'
import { getAmountsFromActiveVault, getLeverageFromValues } from 'functions/fields'
import { convertAprToApy, demagnify, leverageToLtv, magnify } from 'libs/parse'
import moment from 'moment'
import { Store } from 'store/interfaces/store.interface'
import { Options, VaultsSlice } from 'store/interfaces/vaults.interface.'
import { VaultClient } from 'types/classes'
import {
  LockingVaultAmount,
  Positions,
  VaultBaseForString,
  VaultUtilizationResponse,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { ArrayOfVaultInfoResponse } from 'types/generated/mars-mock-credit-manager/MarsMockCreditManager.types'
import { GetState } from 'zustand'
import { NamedSet } from 'zustand/middleware'

export const vaultsSlice = (set: NamedSet<Store>, get: GetState<Store>): VaultsSlice => ({
  isLoading: false,
  availableVaults: [],
  activeVaults: [],
  addApyToVaults: (apys: ApyBreakdown[]) => {
    const updatedAvailableVaults = get().availableVaults.map((availableVault) => {
      const apy = apys?.find((apy) => apy.vaultAddress === availableVault.address)

      if (!apy) return availableVault
      availableVault.apy = apy
      return availableVault
    })

    const updatedActiveVaults = get().activeVaults.map((activeVault) => {
      const apy = apys?.find((apy) => apy.vaultAddress === activeVault.address)

      if (!apy) return activeVault

      activeVault.apy = apy
      activeVault.position.apy.borrow
      activeVault.position.apy = {
        ...apy,
        borrow: activeVault.position.apy.borrow,
        net:
          (apy.total || 0) * activeVault.position.currentLeverage - activeVault.position.apy.borrow,
      }

      return activeVault
    })

    set({
      availableVaults: updatedAvailableVaults,
      activeVaults: updatedActiveVaults,
    })
  },
  getCreditAccounts: async (options?: Options) => {
    const creditAccounts = get().creditAccounts
    if (creditAccounts && !options?.refetch) return creditAccounts

    const nftClient = get().accountNftClient!
    const address = get().userWalletAddress

    const accountIds: string[] = await nftClient
      .query({ tokens: { owner: address, limit: 100 } })
      .then((result: { tokens: string[] }) => result.tokens)

    const creditManagerClient = get().creditManagerClient
    const promises = accountIds?.map((id) =>
      creditManagerClient?.query({ positions: { account_id: id } }),
    )

    const newCreditAccounts = await Promise.all(promises).then((result) =>
      result.map((value) => value as Positions).filter((positions) => positions?.vaults.length),
    )

    set({ creditAccounts: newCreditAccounts })
    return newCreditAccounts
  },
  getVaultAssets: async (options?: Options) => {
    const vaultAssets = get().vaultAssets

    if (vaultAssets && !options?.refetch) return vaultAssets

    const lpTokens = await get().getLpTokens(options)

    const creditManagerClient = get().creditManagerClient!

    const promises = lpTokens.map(async (lpToken) => {
      // Needed as lpTokenValues are very large from vaults
      BigNumber.config({ EXPONENTIAL_AT: [-7, 30] })

      const amount = new BigNumber(lpToken.locked)
        .plus(lpToken.unlocked || 0)
        .plus(lpToken.unlocking || 0)
        .toString()

      return {
        coins: await creditManagerClient.query({
          estimate_withdraw_liquidity: {
            lp_token: {
              amount: amount,
              denom: lpToken.denom,
            },
          },
        }),
        vaultAddress: lpToken.vaultAddress,
        accountId: lpToken.accountId,
      }
    })

    const newVaultAssets = await Promise.all(promises).then((results) =>
      results.map((result) => result as VaultCoinsWithAddress),
    )

    set({ vaultAssets: newVaultAssets })

    return newVaultAssets
  },
  getUnlockTimes: async (options?: Options) => {
    const unlockTimes = get().unlockTimes
    if (unlockTimes && !options?.refetch) return unlockTimes

    const creditAccounts = await get().getCreditAccounts(options)

    const client = get().client

    const promises = creditAccounts.map(async (creditAccount) => {
      const vaultAddress = creditAccount.vaults[0].vault.address
      const vault = get().vaultConfigs.find((vault) => vault.address === vaultAddress)
      const lockupId = (creditAccount.vaults[0].amount as { locking: LockingVaultAmount })?.locking
        ?.unlocking[0]?.id

      if (!client || !vault || isNaN(lockupId)) return null

      const vaultClient = new VaultClient(vault.address, client)

      return {
        unlockAtTimestamp: Math.round(
          Number(
            (
              await vaultClient.query({
                vault_extension: { lockup: { unlocking_position: { lockup_id: lockupId } } },
              })
            ).release_at?.at_time,
          ) / 1e6,
        ),
        vaultAddress: creditAccount.vaults[0].vault.address,
        accountId: creditAccount.account_id,
      }
    })

    const newUnlockTimes = await Promise.all(promises).then((results) =>
      results.map((result) => result as UnlockTimeWithAddress),
    )

    set({ unlockTimes: newUnlockTimes })

    return newUnlockTimes
  },
  getApys: async (options?: Options) => {
    const apys = get().apys
    if (apys && !options?.refetch) {
      get().addApyToVaults(apys)
      return null
    }

    const vaultAddresses = get().vaultConfigs.map((vault) => vault.address)
    const networkConfig = get().networkConfig
    if (!networkConfig.vaultAprUrl) return null

    try {
      const response = await fetch(networkConfig.vaultAprUrl)

      if (response.ok) {
        const data: AprResponse = await response.json()

        const filteredData = data.vaults.filter((aprData) =>
          vaultAddresses.includes(aprData.address),
        )

        const newApys: ApyBreakdown[] = filteredData.map((aprData) => {
          const aprTotal = aprData.apr.projected_apr * 100
          const finalApy = convertAprToApy(aprTotal, 365)

          return {
            vaultAddress: aprData.address,
            total: finalApy,
          }
        })

        set({
          apys: newApys,
        })
        get().addApyToVaults(newApys)
      }

      return null
    } catch {
      return null
    }
  },
  getCaps: async (options?: Options) => {
    const caps = get().caps
    if (caps && !options?.refetch) return caps
    const networkConfig = get().networkConfig
    const creditManagerClient = get().creditManagerClient
    const paramsClient = get().paramsClient

    if (!creditManagerClient) return []

    if (networkConfig.contracts?.params) {
      if (!paramsClient) return []

      const utilizationPromises = Promise.all(
        get().vaultConfigs.map<Promise<VaultUtilizationResponse>>((vaultConfig) =>
          creditManagerClient.query({
            vault_utilization: { vault: { address: vaultConfig.address } },
          }),
        ),
      )

      const depositCapPromises = iterateContractQuery(paramsClient.allVaultConfigs)

      return Promise.all([utilizationPromises, depositCapPromises]).then(
        ([vaultUtilizations, depositCaps]) => {
          return vaultUtilizations.map((utilization) => {
            const depositCap = depositCaps.find(
              (depositCap) => depositCap.addr === utilization.vault.address,
            )
            return {
              address: utilization.vault.address,
              vaultCap: {
                denom: utilization.utilization.denom,
                used: Number(utilization.utilization.amount),
                max: Number(depositCap?.deposit_cap.amount || 0),
              },
            }
          })
        },
      )
    } else {
      let data: VaultCapData[] = []
      const getBatch = async (startAfter?: VaultBaseForString): Promise<void> => {
        const batch: ArrayOfVaultInfoResponse = await creditManagerClient.query({
          vaults_info: { limit: 5, start_after: startAfter },
        })

        const batchProcessed = batch?.map(
          (vaultInfo) =>
            ({
              address: vaultInfo.vault.address,
              vaultCap: {
                denom: vaultInfo.config.deposit_cap.denom,
                used: Number(vaultInfo.utilization.amount),
                max: Number(vaultInfo.config.deposit_cap.amount),
              },
            } as VaultCapData),
        )

        data = [...data, ...batchProcessed]

        if (batch.length === 5) {
          await getBatch({
            address: batchProcessed[batchProcessed.length - 1].address,
          } as VaultBaseForString)
        }
      }

      await getBatch()

      return data
    }
  },
  getLpTokens: async (options?: Options) => {
    const lpTokens = get().lpTokens
    if (lpTokens && !options?.refetch) return lpTokens

    const creditAccounts = await get().getCreditAccounts(options)
    const client = get().client!

    const promises = creditAccounts.map(async (creditAccount) => {
      const vaultAddress = creditAccount.vaults[0].vault.address
      const vault = get().vaultConfigs.find((vault) => vault.address === vaultAddress)

      const vaultClient = new VaultClient(vaultAddress, client)

      const amounts = getAmountsFromActiveVault(creditAccount.vaults[0].amount)
      return {
        locked: Number(
          await vaultClient.query({
            preview_redeem: {
              amount: amounts.locked,
            },
          }),
        ),
        unlocking: amounts.unlocking,
        unlocked: amounts.unlocked,
        denom: vault?.denoms.lpToken || '',
        vaultAddress: creditAccount.vaults[0].vault.address,
        accountId: creditAccount.account_id,
      }
    })

    const newLpTokens = (await Promise.all(promises)).filter((lpToken) => !!lpToken.denom)
    set({ lpTokens: newLpTokens })

    return newLpTokens
  },
  getVaults: async (options?: Options) => {
    if (get().isLoading) return

    set({ isLoading: true })

    const vaultAssets = get().getVaultAssets(options)
    const unlockTimes = get().getUnlockTimes(options)
    const caps = get().getCaps(options)

    return Promise.all([vaultAssets, unlockTimes, caps]).then(
      ([vaultAssets, unlockTimes, caps]) => {
        const { activeVaults, availableVaults } = get().vaultConfigs.reduce(
          (prev, vaultConfig) => {
            const lpTokens = get().lpTokens
            const creditAccounts = get().creditAccounts

            const creditAccountPositions = creditAccounts?.filter(
              (position) => position.vaults[0].vault.address === vaultConfig.address,
            )

            vaultConfig.apy = {
              total: null,
              vaultAddress: vaultConfig.address,
            }

            vaultConfig.vaultCap = caps?.find(
              (cap) => cap.address === vaultConfig.address,
            )?.vaultCap

            // No position = available vault
            if (!creditAccountPositions?.length) {
              prev.availableVaults.push(vaultConfig)
              return prev
            }

            creditAccountPositions.forEach((creditAccountPosition) => {
              const primaryAndSecondaryAmount = vaultAssets.find(
                (vaultAsset) => vaultAsset.accountId === creditAccountPosition.account_id,
              )

              const vaultTokenAmounts = getAmountsFromActiveVault(
                creditAccountPosition.vaults[0].amount,
              )

              const lpTokenAmounts = lpTokens?.find(
                (lpToken) => lpToken.accountId === creditAccountPosition.account_id,
              )

              if (!primaryAndSecondaryAmount || !vaultTokenAmounts || !lpTokenAmounts) {
                prev.availableVaults.push(vaultConfig)
                return prev
              }

              let id: number | undefined
              try {
                id = (creditAccountPosition.vaults[0].amount as { locking: LockingVaultAmount })
                  .locking.unlocking[0].id
              } catch {
                id = undefined
              }

              // Should already filter out null values
              const unlockTime = unlockTimes.find(
                (unlockTime) => unlockTime?.accountId === creditAccountPosition.account_id,
              )?.unlockAtTimestamp

              const primaryAmount = Number(
                findByDenom(primaryAndSecondaryAmount.coins, vaultConfig.denoms.primary)?.amount ||
                  0,
              )
              const secondaryAmount = Number(
                findByDenom(primaryAndSecondaryAmount.coins, vaultConfig.denoms.secondary)
                  ?.amount || 0,
              )

              let primarySupplyAmount = 0
              let secondarySupplyAmount = 0
              let borrowedPrimaryAmount = 0
              let borrowedSecondaryAmount = 0

              const debt = creditAccountPosition.debts[0]

              if (debt) {
                if (debt.denom === vaultConfig.denoms.primary) {
                  borrowedPrimaryAmount = Number(debt.amount)
                } else {
                  borrowedSecondaryAmount = Number(debt.amount)
                }
              }

              const borrowedDenom = debt?.denom || ''
              const secondaryUSDPrice = Number(
                get().assetPricesUSD?.find((coin) => coin.denom === vaultConfig.denoms.secondary)
                  ?.amount || 1,
              )
              const primaryUSDPrice = Number(
                get().assetPricesUSD?.find((coin) => coin.denom === vaultConfig.denoms.primary)
                  ?.amount || 1,
              )
              const primaryAsset = get().whitelistedAssets.find(
                (asset) => asset.denom === vaultConfig.denoms.primary,
              )
              const secondaryAsset = get().whitelistedAssets.find(
                (asset) => asset.denom === vaultConfig.denoms.secondary,
              )

              if (borrowedDenom === vaultConfig.denoms.primary) {
                if (borrowedPrimaryAmount > primaryAmount) {
                  const swapAmount = demagnify(
                    borrowedPrimaryAmount - primaryAmount,
                    primaryAsset?.decimals ?? 6,
                  )
                  const primaryToSwapValue = swapAmount * primaryUSDPrice
                  const secondaryNeeded = magnify(
                    primaryToSwapValue / secondaryUSDPrice,
                    secondaryAsset?.decimals ?? 6,
                  )

                  primarySupplyAmount = 0
                  secondarySupplyAmount = Math.floor(secondaryAmount - secondaryNeeded)
                } else {
                  primarySupplyAmount = primaryAmount - borrowedPrimaryAmount
                  secondarySupplyAmount = secondaryAmount
                }
              } else if (borrowedDenom === vaultConfig.denoms.secondary) {
                if (borrowedSecondaryAmount > secondaryAmount) {
                  const swapAmount = demagnify(
                    borrowedSecondaryAmount - secondaryAmount,
                    secondaryAsset?.decimals ?? 6,
                  )
                  const secondaryToSwapValue = swapAmount * secondaryUSDPrice
                  const primaryNeeded = magnify(
                    secondaryToSwapValue / primaryUSDPrice,
                    primaryAsset?.decimals ?? 6,
                  )

                  secondarySupplyAmount = 0
                  primarySupplyAmount = Math.floor(primaryAmount - primaryNeeded)
                } else {
                  secondarySupplyAmount = secondaryAmount - borrowedSecondaryAmount
                  primarySupplyAmount = primaryAmount
                }
              } else {
                primarySupplyAmount = primaryAmount
                secondarySupplyAmount = secondaryAmount
              }

              const borrowedAmount = Math.max(borrowedPrimaryAmount, borrowedSecondaryAmount)

              const convertToBaseCurrency = get().convertToBaseCurrency
              const redBankAssets = get().redBankAssets
              const primarySupplyValue = convertToBaseCurrency({
                denom: vaultConfig.denoms.primary,
                amount: primarySupplyAmount.toString(),
              })

              const secondarySupplyValue = convertToBaseCurrency({
                denom: vaultConfig.denoms.secondary,
                amount: secondarySupplyAmount.toString(),
              })

              const borrowedValue = convertToBaseCurrency({
                denom: borrowedDenom,
                amount: borrowedAmount.toString(),
              })

              const values = {
                primary: primarySupplyValue,
                secondary: secondarySupplyValue,
                borrowedPrimary: borrowedDenom === vaultConfig.denoms.primary ? borrowedValue : 0,
                borrowedSecondary:
                  borrowedDenom === vaultConfig.denoms.secondary ? borrowedValue : 0,
                net: primarySupplyValue + secondarySupplyValue,
                total: primarySupplyValue + secondarySupplyValue + borrowedValue,
              }

              const leverage = getLeverageFromValues(values)

              const borrowRate =
                redBankAssets.find((asset) => asset.denom === borrowedDenom)?.borrowRate || 0

              const trueBorrowRate = (leverage - 1) * borrowRate

              const getPositionStatus = (unlockTime?: number) => {
                if (!unlockTime) return 'active'

                const isUnlocked = moment(unlockTime).isBefore(new Date())
                if (isUnlocked) return 'unlocked'

                return 'unlocking'
              }

              const position: Position = {
                id: id,
                accountId: creditAccountPosition.account_id,
                amounts: {
                  primary: primarySupplyAmount,
                  secondary: secondarySupplyAmount,
                  borrowedPrimary:
                    borrowedDenom === vaultConfig.denoms.primary ? borrowedAmount : 0,
                  borrowedSecondary:
                    borrowedDenom === vaultConfig.denoms.secondary ? borrowedAmount : 0,
                  lp: {
                    amount: vaultTokenAmounts.unlocking,
                    primary: Number(
                      primaryAndSecondaryAmount.coins.find(
                        (coin) => coin.denom === vaultConfig.denoms.primary,
                      )?.amount || 0,
                    ),
                    secondary: Number(
                      primaryAndSecondaryAmount.coins.find(
                        (coin) => coin.denom === vaultConfig.denoms.secondary,
                      )?.amount || 0,
                    ),
                  },
                  vault: vaultTokenAmounts.locked,
                },
                values,
                apy: {
                  vaultAddress: vaultConfig.address,
                  borrow: trueBorrowRate,
                  total: null,
                  net: null,
                },
                currentLeverage: leverage,
                ltv: leverageToLtv(leverage),
                ...(unlockTime ? { unlockAtTimestamp: unlockTime } : {}),
                status: getPositionStatus(unlockTime),
                borrowDenom: borrowedDenom,
              }

              prev.activeVaults.push({ ...vaultConfig, position })
            })

            return prev
          },
          { activeVaults: [], availableVaults: [] } as {
            activeVaults: ActiveVault[]
            availableVaults: Vault[]
          },
        )
        set({ activeVaults, availableVaults, isLoading: false })
        get().getApys(options)
      },
    )
  },
})
