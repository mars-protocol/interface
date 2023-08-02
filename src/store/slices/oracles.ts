import { Coin } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'
import { updateExchangeRate } from 'functions'
import { updateAssetPrices } from 'functions/updateAssetPrices'
import { findAssetByDenom, lookup } from 'libs/parse'
import isEqual from 'lodash.isequal'
import { OraclesSlice } from 'store/interfaces/oracles.interface'
import { Store } from 'store/interfaces/store.interface'
import { State } from 'types/enums'
import { GetState } from 'zustand'
import { NamedSet } from 'zustand/middleware'

const oraclesSlice = (set: NamedSet<Store>, get: GetState<Store>): OraclesSlice => ({
  // ------------------
  // VARIABLES
  // ------------------
  exchangeRatesState: State.INITIALISING,
  assetPricesUSDState: State.INITIALISING,
  marsPriceState: State.INITIALISING,
  basePriceState: State.INITIALISING,
  migrationInProgress: false,
  pythVaa: {
    priceFeeds: [],
    data: [],
  },
  // ------------------
  // GENERAL FUNCTIONS
  // ------------------
  convertToDisplayCurrency: (coin: Coin) => {
    const whitelistedAssets = get().whitelistedAssets
    const exchangeRates = get().exchangeRates
    const assetPricesUSD = get().assetPricesUSD
    const otherAssets = get().otherAssets
    const networkConfig = get().networkConfig
    const displayCurrency = networkConfig.displayCurrency
    const exchangeRatesState = get().exchangeRatesState
    const assetPricesUSDState = get().assetPricesUSDState
    const assets: OtherAsset[] = [...whitelistedAssets, ...otherAssets]

    if (
      !coin ||
      exchangeRatesState === State.INITIALISING ||
      assetPricesUSDState === State.INITIALISING ||
      !assetPricesUSD ||
      !exchangeRates ||
      !assets.length ||
      !displayCurrency
    ) {
      return 0
    }

    if (coin.denom === displayCurrency.denom) {
      const displayAsset = findAssetByDenom(displayCurrency.denom, assets)
      if (!displayAsset) return 0
      return lookup(Number(coin.amount), displayAsset.symbol, displayAsset.decimals)
    }

    const assetInfo = assets.find((asset) => asset.denom === coin.denom)

    const assetPrice = Number(
      assetPricesUSD.find((assetPrice) => assetPrice.denom === coin.denom)?.amount,
    )

    if (!assetInfo || !assetPrice) return 0
    const decimals = assetInfo.decimals

    if (displayCurrency.denom === 'usd') {
      const amount = new BigNumber(coin.amount)
        .dividedBy(10 ** decimals)
        .times(assetPrice)
        .toNumber()
      return amount < 0.01 ? 0 : amount
    }

    const exchangeRate = Number(
      exchangeRates.find((exchangeRate) => exchangeRate.denom === coin.denom)?.amount,
    )
    if (!exchangeRate) return 0

    const amount = new BigNumber(coin.amount)
      .dividedBy(10 ** decimals)
      .times(exchangeRate)
      .toNumber()

    // Prevent extremely small numbers
    return amount < 0.001 ? 0 : amount
  },
  getExchangeRate: (denom1: string, denom2?: string) => {
    const assets = [...get().whitelistedAssets, ...get().otherAssets]
    if (!denom2) {
      denom2 = get().baseCurrency?.denom
    }

    const asset1 = assets.find((asset) => asset.denom === denom1)
    const asset2 = assets.find((asset) => asset.denom === denom2)

    const assetPricesUSD = get().assetPricesUSD
    const asset1Price = assetPricesUSD?.find((coin) => coin.denom === denom1)?.amount
    const asset2Price = assetPricesUSD?.find((coin) => coin.denom === denom2)?.amount

    if (asset1Price && asset1 && asset2Price && asset2) {
      return new BigNumber(asset1Price).div(asset2Price).toNumber()
    }
    return 1
  },
  calculateExchangeRates: () => {
    const assetPricesUSD = get().assetPricesUSD
    const displayCurrency = get().networkConfig.displayCurrency
    let exchangeRates: Coin[] = get().exchangeRates ?? []

    if (!displayCurrency || !assetPricesUSD) return

    const displayCurrencyPrice = assetPricesUSD?.find(
      (asset) => asset.denom === displayCurrency.denom,
    ) ?? { denom: displayCurrency.denom, amount: '1' }
    assetPricesUSD.forEach((asset) => {
      if (asset.denom === displayCurrency.denom) {
        exchangeRates = updateExchangeRate({ denom: asset.denom, amount: '1' }, exchangeRates)
      } else {
        exchangeRates = updateExchangeRate(
          {
            denom: asset.denom,
            amount: new BigNumber(asset.amount).div(displayCurrencyPrice.amount).toString(),
          },
          exchangeRates,
        )
      }
    })
    set({
      exchangeRates,
      exchangeRatesState: State.READY,
    })
  },
  handleMigration: () => {
    if (!get().migrationInProgress) return

    set({
      exchangeRates: [],
      exchangeRatesState: State.INITIALISING,
      assetPricesUSD: [],
      assetPricesUSDState: State.INITIALISING,
      basePriceState: State.INITIALISING,
    })
  },
  setPythVaa: (sources: PriceSource[]) => {
    if (!sources || sources.length === 0) return

    const whitelistedAssets = get().whitelistedAssets
    const otherAssets = get().otherAssets
    const allAssets = [...whitelistedAssets, ...otherAssets]

    if (allAssets.length === 0) return

    const pythAssetFeedIds: string[] = []
    allAssets.forEach((asset) => {
      const priceSource = sources.find((source) => source.denom === asset.denom)?.price_source
      const isPyth = priceSource && !!(priceSource as PythPriceSource).pyth

      if (isPyth) {
        pythAssetFeedIds.push((priceSource as PythPriceSource).pyth.price_feed_id)
      }
    })

    if (pythAssetFeedIds.length === 0) return

    const data = get().pythVaa.data
    set({ pythVaa: { priceFeeds: pythAssetFeedIds, data } })
  },
  // ------------------
  // SETTERS
  // ------------------
  setExchangeRatesState: (state: State) => set({ exchangeRatesState: state }),

  // ------------------
  // QUERY RELATED
  // ------------------
  processMarsOracleQuery: (data: OracleData) => {
    if (isEqual(data, get().previousMarsOracleQueryData)) return

    const migrationInProgress = data.sources.price_sources.length === 0
    set({ migrationInProgress })

    if (migrationInProgress) {
      get().handleMigration()
      return
    }

    get().setPythVaa(data.sources.price_sources)

    const pricesQueryResult = data.prices
    const oracleBaseDenom = data.oracle.config.base_denom.toLocaleLowerCase()
    let assetPricesUSD: Coin[] = get().assetPricesUSD ?? []

    get()
      .whitelistedAssets?.filter((asset: Asset) => !!asset.denom)
      .forEach((asset: Asset) => {
        const denom = asset.denom
        const id = asset.id

        const queryResult = pricesQueryResult[`${id}`]?.price ?? '0.00'
        const isNonUSDOracle = oracleBaseDenom.toLowerCase().indexOf('usd') === -1

        // Non-USD denominated oracle prices
        if (isNonUSDOracle) {
          if (get().basePriceState !== State.READY) return
          const baseCurrencyPrice = assetPricesUSD.find(
            (assetPrice) => assetPrice.denom === oracleBaseDenom,
          )
          if (baseCurrencyPrice && denom !== oracleBaseDenom) {
            const additionalDecimals =
              asset.decimals > get().baseCurrency.decimals
                ? asset.decimals - get().baseCurrency.decimals
                : 0

            const assetPrice = {
              denom,
              amount:
                typeof queryResult === 'string'
                  ? new BigNumber(queryResult)
                      .times(10 ** additionalDecimals)
                      .times(baseCurrencyPrice.amount)
                      .toString() || '0.00'
                  : '0.00',
            }
            assetPricesUSD = updateAssetPrices(assetPrice, assetPricesUSD)
          }
        } else {
          // USD denominated oracle prices

          if (asset.denom === get().baseAsset?.denom) {
            set({ basePriceState: State.READY })
          }
          const assetPrice = {
            denom,
            amount: typeof queryResult === 'string' ? queryResult : '0.00',
          }

          assetPricesUSD = updateAssetPrices(assetPrice, assetPricesUSD)
        }
      })

    set({
      previousMarsOracleQueryData: data,
      assetPricesUSD,
      assetPricesUSDState: State.READY,
    })

    get().calculateExchangeRates()
  },
})

export default oraclesSlice
