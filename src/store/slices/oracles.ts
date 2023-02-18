import { Coin } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'
import { updateExchangeRate } from 'functions/updateExchangeRate'
import { MarsOracleData } from 'hooks/queries/useMarsOracle'
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
  // ------------------
  // GENERAL FUNCTIONS
  // ------------------
  convertToDisplayCurrency: (coin: Coin) => {
    const whitelistedAssets = get().whitelistedAssets
    const exchangeRates = get().exchangeRates
    const otherAssets = get().otherAssets
    const baseCurrency = get().baseCurrency
    const networkConfig = get().networkConfig
    const displayCurrency = networkConfig?.displayCurrency
    const assets = [...whitelistedAssets, ...otherAssets]

    if (!coin || !exchangeRates || !assets.length || !displayCurrency) {
      return 0
    }

    if (coin.denom.toLowerCase() === displayCurrency.denom.toLowerCase()) {
      const displayAsset = findAssetByDenom(displayCurrency.denom, assets)
      if (!displayAsset) return 0
      return lookup(Number(coin.amount), displayAsset.symbol, displayAsset.decimals)
    }

    const assetToBaseRatio = Number(
      exchangeRates.find((exchangeRate) => exchangeRate.denom === coin.denom)?.amount,
    )
    const baseToDisplayCurrencyRatio = get().baseToDisplayCurrencyRatio
    const assetInfo = assets.find((asset) => asset.denom === coin.denom)

    if (!assetToBaseRatio || !baseToDisplayCurrencyRatio || !assetInfo) return 0

    const decimals = assetInfo.decimals
    let amount = 0
    if (coin.denom === baseCurrency.denom) {
      amount = new BigNumber(coin.amount)
        .dividedBy(10 ** decimals)
        .times(baseToDisplayCurrencyRatio)
        .toNumber()
    } else {
      amount = new BigNumber(coin.amount)
        .dividedBy(10 ** decimals)
        .times(assetToBaseRatio)
        .times(baseToDisplayCurrencyRatio)
        .toNumber()
    }
    // Prevent extremely small numbers
    return amount < 0.005 ? 0 : amount
  },
  getExchangeRate: (denom1: string, denom2?: string) => {
    if (!denom2) {
      denom2 = get().baseAsset?.denom
    }
    const exchangeRates = get().exchangeRates
    const asset1 = exchangeRates?.find((coin) => coin.denom === denom1)
    const asset2 = exchangeRates?.find((coin) => coin.denom === denom2)
    if (asset1 && asset2) {
      return new BigNumber(asset1.amount).div(asset2.amount).toNumber()
    }
    return 1
  },
  // ------------------
  // SETTERS
  // ------------------
  setExchangeRatesState: (state: State) => set({ exchangeRatesState: state }),
  setExchangeRates: (rates: Coin[]) => set({ exchangeRates: rates }),

  // ------------------
  // QUERY RELATED
  // ------------------
  processMarsOracleQuery: (data: MarsOracleData) => {
    if (isEqual(data, get().previousMarsOracleQueryData)) return

    const wasmQueryResults = data.prices
    const exchangeRates: Coin[] = get().exchangeRates ?? []

    get()
      .whitelistedAssets?.filter((asset: Asset) => !!asset.denom)
      .forEach((asset: Asset) => {
        const denom = asset.denom

        if (denom === get().baseCurrency.denom) {
          exchangeRates.push({ denom, amount: '1' })
          return
        }

        const symbol = asset.symbol
        const exchangeRateResult = wasmQueryResults[`${symbol}`].price || '0.00'
        // Fix for a LCDClientError object instead of string
        const exchangeRate: Coin = {
          denom,
          amount: typeof exchangeRateResult === 'string' ? exchangeRateResult || '0.00' : '0.00',
        }
        updateExchangeRate(exchangeRate, exchangeRates)
      })
    set({
      previousMarsOracleQueryData: data,
      exchangeRatesState: State.READY,
      exchangeRates,
    })
  },
})

export default oraclesSlice
