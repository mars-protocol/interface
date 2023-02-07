import { Coin } from '@cosmjs/stargate'
import { MARS_SYMBOL } from 'constants/appConstants'
import { SECONDS_IN_YEAR } from 'constants/timeConstants'
import { findByDenom } from 'functions'
import { UserDebtData } from 'hooks/queries/useUserDebt'
import { UserDepositData } from 'hooks/queries/useUserDeposit'
import { lookupDenomBySymbol } from 'libs/parse'
import isEqual from 'lodash.isequal'
import { RedBankSlice } from 'store/interfaces/redBank.interface'
import { Store } from 'store/interfaces/store.interface'
import colors from 'styles/_assets.module.scss'
import { State } from 'types/enums'
import { GetState } from 'zustand'
import { NamedSet } from 'zustand/middleware'

const redBankSlice = (set: NamedSet<Store>, get: GetState<Store>): RedBankSlice => ({
  marketAssetLiquidity: [],
  marketIncentiveInfo: [],
  marketInfo: [],
  redBankAssets: [],
  redBankState: State.INITIALISING,
  userBalancesState: State.INITIALISING,
  // ------------------
  // GENERAL FUNCTIONS
  // ------------------
  calculateIncentiveAssetInfo: (
    incentive?: MarketIncentive | Record<string, any>,
    marketTotalLiquidity?: Coin,
  ): IncentiveInfo | undefined => {
    const otherAssets = get().otherAssets
    const whitelistedAssets = get().whitelistedAssets
    const convertToBaseCurrency = get().convertToBaseCurrency
    const marsAsset = get().otherAssets?.find((asset) => asset.denom === MARS_SYMBOL)
    if (
      !incentive?.asset_incentive ||
      !marketTotalLiquidity ||
      !whitelistedAssets ||
      !convertToBaseCurrency
    )
      return

    const anualEmission = Number(incentive.asset_incentive.emission_per_second) * SECONDS_IN_YEAR
    const anualEmissionVaule = convertToBaseCurrency({
      denom: lookupDenomBySymbol(MARS_SYMBOL, otherAssets),
      amount: anualEmission.toString(),
    })
    const liquidityValue = convertToBaseCurrency(marketTotalLiquidity)
    const incentiveApr = anualEmissionVaule / liquidityValue

    return {
      symbol: marsAsset?.symbol || MARS_SYMBOL,
      color: marsAsset?.color || colors.mars,
      apy: incentiveApr * 100,
    }
  },
  computeMarketLiquidity: (denom: string) => {
    return Number(get().marketAssetLiquidity.find((asset) => asset.denom === denom)?.amount) || 0
  },
  findUserDebt: (denom: string) =>
    Number(get().userDebts?.find((asset) => asset.denom === denom)?.amount) || 0,
  findUserDeposit: (denom: string) =>
    Number(
      get()
        .userDeposits?.find((asset) => asset.denom === denom)
        ?.amount.toString(),
    ) || 0,
  // ------------------
  // SETTERS
  // ------------------
  setRedBankAssets: () => {
    if (
      get().exchangeRatesState !== State.READY ||
      get().userBalancesState !== State.READY ||
      get().redBankState !== State.READY
    )
      return
    const redBankAssets: RedBankAsset[] = []
    const marketAssetLiquidity: Coin[] = []
    const whitelistedAssets = get().whitelistedAssets

    if (!whitelistedAssets?.length) return

    whitelistedAssets.forEach((asset) => {
      const assetWallet = findByDenom(get().userBalances, asset.denom) as Coin
      const convertToBaseCurrency = get().convertToBaseCurrency
      const reserveInfo = findByDenom(get().marketInfo, asset.denom)
      const depositApy = reserveInfo?.liquidity_rate || 0
      const incentiveInfo = get().calculateIncentiveAssetInfo(
        findByDenom(get().marketIncentiveInfo, asset.denom),
        { denom: asset.denom, amount: get().computeMarketLiquidity(asset.denom).toString() },
      )
      const borrowApy = reserveInfo?.borrow_rate || 0
      const depositBalance = get().findUserDeposit(asset.denom)
      const borrowBalance = get().findUserDebt(asset.denom)
      const marketInfo = get().marketInfo.find((info) => info.denom === asset.denom)
      const depositCap = Number(marketInfo?.deposit_cap) || 0
      const depositLiquidity =
        Number(get().marketDeposits.find((coin) => coin.denom === asset.denom)?.amount) || 0
      const debtLiquidity =
        Number(get().marketDebts.find((coin) => coin.denom === asset.denom)?.amount) || 0

      const marketLiquidity = (depositLiquidity - debtLiquidity).toString()
      marketAssetLiquidity.push({ denom: asset.denom, amount: marketLiquidity })
      const redBankAsset: RedBankAsset = {
        ...asset,
        walletBalance: assetWallet?.amount.toString(),
        depositBalance: depositBalance.toString(),
        depositBalanceBaseCurrency: convertToBaseCurrency({
          denom: asset.denom,
          amount: depositBalance.toString(),
        }),
        borrowBalance: borrowBalance.toString(),
        borrowBalanceBaseCurrency: convertToBaseCurrency({
          denom: asset.denom,
          amount: borrowBalance.toString(),
        }),
        borrowRate: borrowApy * 100 >= 0.01 ? borrowApy * 100 : 0.0,
        apy: depositApy * 100 >= 0.01 ? depositApy * 100 : 0.0,
        depositLiquidity: depositLiquidity,
        marketLiquidity: marketLiquidity,
        incentiveInfo,
        isCollateral: true,
        depositCap: depositCap,
      }
      redBankAsset.subRows = [{ ...redBankAsset }]
      redBankAssets.push(redBankAsset)
    })

    set({
      redBankAssets,
      marketAssetLiquidity,
    })
  },
  setUserBalancesState: (userBalancesState: State) => set({ userBalancesState }),
  setRedBankState: (state: State) => {
    set({ redBankState: state })
  },
  // ------------------
  // QUERY RELATED
  // ------------------
  processRedBankQuery: (data: RedBankData, whitelistedAssets: Asset[]) => {
    if (isEqual(data, get().previousRedBankQueryData)) return

    const userUnclaimedRewards = data.rbwasmkey.unclaimedRewards
    const marketInfo: Market[] = []
    const marketIncentiveInfo: MarketIncentive[] = []

    whitelistedAssets?.forEach((asset: Asset) => {
      const denom = asset.denom
      const symbol = asset.symbol
      const queryResult = data.rbwasmkey
      const marketData = {
        ...queryResult[`${symbol}Market`],
        denom: denom,
      }
      marketInfo.push(marketData)

      const marketIncentiveData = {
        ...queryResult[`${symbol}MarketIncentive`],
        denom: denom,
      }
      marketIncentiveInfo.push(marketIncentiveData)
    })
    set({
      marketInfo,
      marketIncentiveInfo,
      previousRedBankQueryData: data,
      userCollateral: data.rbwasmkey.collateral,
      userUnclaimedRewards,
      redBankState: State.READY,
    })
  },
  findCollateral: (denom: string) => {
    return get().userCollateral && get().userCollateral!.find((item) => item.denom === denom)
  },
  processUserDebtQuery: (data: UserDebtData) => {
    if (isEqual(data, get().previousUserDebtQueryData)) return

    const debtsResponse = data.debts.debts
    set({
      previousUserDebtQueryData: data,
      userDebts: debtsResponse.map((debt) => {
        return { denom: debt.denom, amount: debt.amount }
      }),
    })
  },
  processUserDepositQuery: (data: UserDepositData) => {
    if (isEqual(data, get().previousUserDepositQueryData)) return

    const deposits = data.deposits.deposits

    if (!deposits) return

    const userDeposits = deposits.map((deposit) => ({
      denom: deposit.denom,
      amount: deposit.amount,
    }))
    set({ previousUserDepositQueryData: data, userDeposits })
  },
})

export default redBankSlice
