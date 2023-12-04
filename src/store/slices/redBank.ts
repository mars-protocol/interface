import { Coin } from '@cosmjs/stargate'
import { MARS_SYMBOL } from 'constants/appConstants'
import { SECONDS_IN_YEAR } from 'constants/timeConstants'
import { findByDenom } from 'functions'
import { findAssetByDenom, lookupDenomBySymbol } from 'libs/parse'
import isEqual from 'lodash.isequal'
import moment from 'moment'
import { RedBankSlice } from 'store/interfaces/redBank.interface'
import { Store } from 'store/interfaces/store.interface'
import colors from 'styles/_assets.module.scss'
import { State } from 'types/enums'
import { AssetParamsBaseForAddr } from 'types/generated/mars-params/MarsParams.types'
import { GetState } from 'zustand'
import { NamedSet } from 'zustand/middleware'

const redBankSlice = (set: NamedSet<Store>, get: GetState<Store>): RedBankSlice => ({
  marketAssetLiquidity: [],
  marketInfo: [],
  redBankAssets: [],
  redBankState: State.INITIALISING,
  showRedBankTutorial: false,
  userBalancesState: State.INITIALISING,
  // ------------------
  // GENERAL FUNCTIONS
  // ------------------
  calculateIncentiveAssetsInfo: (
    incentives?: MarketIncentive[] | Record<string, any>,
    marketTotalLiquidity?: Coin,
  ): IncentiveInfo[] | undefined => {
    const assets = [...get().networkConfig.assets.other, ...get().networkConfig.assets.whitelist]
    const convertToBaseCurrency = get().convertToBaseCurrency
    if (!incentives?.length || !marketTotalLiquidity || !assets || !convertToBaseCurrency) return

    return incentives.map((incentive: MarketIncentive) => {
      const incentiveAsset = findAssetByDenom(incentive.denom, assets)
      if (!incentiveAsset)
        return {
          symbol: MARS_SYMBOL,
          color: colors.mars,
          apy: 0,
        }
      const startTime = incentive.start_time ?? 0
      const duration = incentive.duration ?? 0
      const isValid = moment().isBefore(moment(startTime + duration))
      if (!isValid)
        return {
          symbol: incentiveAsset.symbol,
          color: incentiveAsset.color,
          apy: 0,
        }
      const anualEmission = Number(incentive.emission_per_second) * SECONDS_IN_YEAR
      const anualEmissionVaule = convertToBaseCurrency({
        denom: incentive.denom,
        amount: anualEmission.toString(),
      })
      const liquidityValue = convertToBaseCurrency(marketTotalLiquidity)
      const incentiveApr = anualEmissionVaule / liquidityValue

      return {
        symbol: incentiveAsset.symbol,
        color: incentiveAsset.color,
        apy: incentiveApr * 100,
      }
    })
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
    if (get().exchangeRatesState !== State.READY || get().userBalancesState !== State.READY) return
    const params = get().assetParams
    const redBankAssets: RedBankAsset[] = []
    const marketAssetLiquidity: Coin[] = []
    const whitelistedAssets = get().networkConfig.assets.whitelist

    if (!whitelistedAssets?.length) return

    whitelistedAssets.forEach((asset) => {
      const assetWallet = findByDenom(get().userBalances, asset.denom) as Coin
      const convertToBaseCurrency = get().convertToBaseCurrency
      const reserveInfo = findByDenom(get().marketInfo, asset.denom)
      const depositApy = reserveInfo?.liquidity_rate || 0
      const borrowApy = reserveInfo?.borrow_rate || 0
      const depositBalance = get().findUserDeposit(asset.denom)
      const borrowBalance = get().findUserDebt(asset.denom)
      const marketInfo = get().marketInfo.find((info) => info.denom === asset.denom)
      const depositCap = params.find((param) => param.denom === asset.denom)?.cap
      const depositLiquidity =
        Number(get().marketDeposits.find((coin) => coin.denom === asset.denom)?.amount) || 0
      const debtLiquidity =
        Number(get().marketDebts.find((coin) => coin.denom === asset.denom)?.amount) || 0

      const marketLiquidity = (depositLiquidity - debtLiquidity).toString()
      marketAssetLiquidity.push({ denom: asset.denom, amount: marketLiquidity })

      const incentiveInfo = get().calculateIncentiveAssetsInfo(
        findByDenom(get().marketInfo, asset.denom)?.incentives,
        { denom: asset.denom, amount: depositLiquidity.toString() },
      )
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
        depositCap: depositCap
          ? depositCap
          : { amount: marketInfo?.deposit_cap || '0', used: String(depositLiquidity) },
        borrowEnabled: !!marketInfo?.borrow_enabled,
        depositEnabled: !!marketInfo?.deposit_enabled,
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
  processRedBankQuery: (
    data: RedBankData,
    whitelistedAssets: Asset[],
    assetParams: AssetParamsBaseForAddr[],
  ) => {
    if (isEqual(data, get().previousRedBankQueryData) && get().marketInfo.length) return

    const marketInfo: Market[] = []
    const assets = [...whitelistedAssets, ...get().networkConfig.assets.other]
    const MARS_DENOM = lookupDenomBySymbol(MARS_SYMBOL, assets)
    const hasMultiAssetIncentives = get().networkConfig.hasMultiAssetIncentives
    whitelistedAssets?.forEach((asset: Asset) => {
      const denom = asset.denom
      const id = asset.id
      const queryResult = data.rbwasmkey

      const marketData: Market = {
        ...queryResult[`${id}Market`],
        denom: denom,
        incentives: [],
      }

      const assetParam = assetParams.find((param) => param.denom === denom)

      if (assetParam) {
        marketData.borrow_enabled = assetParam.red_bank.borrow_enabled
        marketData.deposit_enabled = assetParam.red_bank.deposit_enabled
        marketData.max_loan_to_value = assetParam.max_loan_to_value
        marketData.liquidation_threshold = assetParam.liquidation_threshold
        marketData.deposit_cap = assetParam.deposit_cap
      }

      if (hasMultiAssetIncentives) {
        const marketIncentiveData =
          (queryResult[`${id}MarketIncentive`] as MultiAssetMarketIncentive[]) ?? []
        marketIncentiveData.forEach((incentive) => {
          marketData.incentives.push({
            denom: incentive.denom,
            emission_per_second: String(incentive.emission_rate),
          })
        })
      } else {
        const marketIncentiveData = {
          ...queryResult[`${id}MarketIncentive`],
          denom: MARS_DENOM,
        } as MarketIncentive
        const isValid =
          marketIncentiveData?.emission_per_second &&
          moment(
            (marketIncentiveData?.start_time ?? 0) + (marketIncentiveData?.duration ?? 0),
          ).isBefore(moment.now())
        if (isValid) marketData.incentives.push(marketIncentiveData)
      }
      marketInfo.push(marketData)
    })

    const userUnclaimedRewards =
      hasMultiAssetIncentives && typeof data.rbwasmkey.unclaimedRewards === 'object'
        ? data.rbwasmkey.unclaimedRewards
        : ([{ denom: MARS_DENOM, amount: data.rbwasmkey.unclaimedRewards }] as Coin[])

    set({
      marketInfo,
      previousRedBankQueryData: data,
      userUnclaimedRewards,
    })
  },
  findCollateral: (denom: string) => {
    return get().userCollateral && get().userCollateral!.find((item) => item.denom === denom)
  },
})

export default redBankSlice
