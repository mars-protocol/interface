import BigNumber from 'bignumber.js'
import { findByDenom } from 'functions'
import { getAmountsFromActiveVault, getLeverageFromValues } from 'functions/fields'
import { convertAprToApy, leverageToLtv } from 'libs/parse'
import moment from 'moment'
import { Store } from 'store/interfaces/store.interface'
import { Options, VaultsSlice } from 'store/interfaces/vaults.interface.'
import { VaultClient } from 'types/classes'
import {
  ArrayOfVaultInfoResponse,
  LockingVaultAmount,
  Positions,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { VaultBaseForString } from 'types/generated/mars-mock-credit-manager/MarsMockCreditManager.types'
import { GetState } from 'zustand'
import { NamedSet } from 'zustand/middleware'

export const vaultsSlice = (set: NamedSet<Store>, get: GetState<Store>): VaultsSlice => ({
  isLoading: false,
  availableVaults: [],
  activeVaults: [],
  addAprToVaults: (aprs: AprData[]) => {
    const updatedAvailableVaults = get().availableVaults.map((availableVault) => {
      const apr =
        (aprs?.find((apr) => apr.contractAddress === availableVault.address)?.apr || 0) * 100
      availableVault.apy = convertAprToApy(apr, 365)
      return availableVault
    })

    const updatedActiveVaults = get().activeVaults.map((activeVault) => {
      const apr = (aprs?.find((apr) => apr.contractAddress === activeVault.address)?.apr || 0) * 100
      const apy = convertAprToApy(apr, 365)
      activeVault.apy = apy
      activeVault.position.apy.total = apy
      activeVault.position.apy.net =
        apy * activeVault.position.currentLeverage - activeVault.position.apy.borrow
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
      result.map((value) => value as Positions).filter((positions) => positions.vaults.length),
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
      }
    })

    const newUnlockTimes = await Promise.all(promises).then((results) =>
      results.map((result) => result as UnlockTimeWithAddress),
    )

    set({ unlockTimes: newUnlockTimes })

    return newUnlockTimes
  },
  getAprs: async (options?: Options) => {
    const aprs = get().aprs
    if (aprs && !options?.refetch) {
      get().addAprToVaults(aprs)
      return null
    }

    const networkConfig = get().networkConfig
    if (!networkConfig) return null

    try {
      const response = await fetch(networkConfig!.apolloAprUrl)

      if (response.ok) {
        const data: AprResponse[] = await response.json()

        const newAprs = data.map((aprData) => {
          const aprTotal = aprData.apr.reduce((prev, curr) => Number(curr.value) + prev, 0)
          const feeTotal = aprData.fees.reduce((prev, curr) => Number(curr.value) + prev, 0)

          const finalApr = aprTotal + feeTotal

          return { contractAddress: aprData.contract_address, apr: finalApr }
        })

        set({
          aprs: newAprs,
        })

        get().addAprToVaults(newAprs)
      }

      return null
    } catch {
      return null
    }
  },
  getCaps: async (options?: Options) => {
    const caps = get().caps
    if (caps && !options?.refetch) return caps

    const creditManagerClient = get().creditManagerClient

    if (!creditManagerClient) return []

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
          (prev, curr) => {
            const lpTokens = get().lpTokens
            const creditAccounts = get().creditAccounts

            const creditAccountPosition = creditAccounts?.find(
              (position) => position.vaults[0].vault.address === curr.address,
            )

            curr.apy = null

            curr.vaultCap = caps?.find((cap) => cap.address === curr.address)?.vaultCap

            // No position = available vault
            if (!creditAccountPosition) {
              prev.availableVaults.push(curr)
              return prev
            }

            // Position = active vault
            const primaryAndSecondaryAmount = vaultAssets.find(
              (vaultAsset) => vaultAsset.vaultAddress === curr.address,
            )

            const vaultTokenAmounts = getAmountsFromActiveVault(
              creditAccountPosition.vaults[0].amount,
            )

            const lpTokenAmounts = lpTokens?.find(
              (lpToken) => lpToken.vaultAddress === curr.address,
            )

            if (!primaryAndSecondaryAmount || !vaultTokenAmounts || !lpTokenAmounts) {
              prev.availableVaults.push(curr)
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
              (unlockTime) => unlockTime?.vaultAddress === curr.address,
            )?.unlockAtTimestamp

            let primarySupplyAmount = Number(
              findByDenom(primaryAndSecondaryAmount.coins, curr.denoms.primary)?.amount || 0,
            )
            const secondaryAmount = Number(
              findByDenom(primaryAndSecondaryAmount.coins, curr.denoms.secondary)?.amount || 0,
            )
            const borrowedAmount = Number(creditAccountPosition.debts[0]?.amount || 0)

            if (borrowedAmount > secondaryAmount) {
              const swappedToPrimary = Math.round(
                get().convertToBaseCurrency({
                  denom: curr.denoms.secondary,
                  amount: (borrowedAmount - secondaryAmount).toString(),
                }),
              )
              primarySupplyAmount -= swappedToPrimary
            }

            const secondarySupplyAmount = Math.max(secondaryAmount - borrowedAmount, 0)

            const convertToBaseCurrency = get().convertToBaseCurrency
            const redBankAssets = get().redBankAssets
            const primaryValue = convertToBaseCurrency({
              denom: curr.denoms.primary,
              amount: primarySupplyAmount.toString(),
            })

            const secondaryValue = convertToBaseCurrency({
              denom: curr.denoms.secondary,
              amount: secondarySupplyAmount.toString(),
            })

            const borrowedValue = convertToBaseCurrency({
              denom: curr.denoms.secondary,
              amount: borrowedAmount.toString(),
            })

            const values = {
              primary: primaryValue,
              secondary: secondaryValue,
              borrowed: borrowedValue,
              net: primaryValue + secondaryValue,
              total: primaryValue + secondaryValue + borrowedValue,
            }

            const leverage = getLeverageFromValues(values)
            const borrowRate =
              redBankAssets.find((asset) => asset.denom === curr.denoms.secondary)?.borrowRate || 0

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
                borrowed: borrowedAmount,
                lp: {
                  amount: vaultTokenAmounts.unlocking,
                  primary: Number(
                    primaryAndSecondaryAmount.coins.find(
                      (coin) => coin.denom === curr.denoms.primary,
                    )?.amount || 0,
                  ),
                  secondary: Number(
                    primaryAndSecondaryAmount.coins.find(
                      (coin) => coin.denom === curr.denoms.secondary,
                    )?.amount || 0,
                  ),
                },
                vault: vaultTokenAmounts.locked,
              },
              values,
              apy: {
                total: null,
                borrow: trueBorrowRate,
                net: null,
              },
              currentLeverage: leverage,
              ltv: leverageToLtv(leverage),
              ...(unlockTime ? { unlockAtTimestamp: unlockTime } : {}),
              status: getPositionStatus(unlockTime),
            }

            prev.activeVaults.push({ ...curr, position })

            return prev
          },
          { activeVaults: [], availableVaults: [] } as {
            activeVaults: ActiveVault[]
            availableVaults: Vault[]
          },
        )

        set({ activeVaults, availableVaults, isLoading: false })
        get().getAprs(options)
      },
    )
  },
})
