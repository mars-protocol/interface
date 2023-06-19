import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { updateAssetPrices } from 'functions/updateAssetPrices'
import { updateExchangeRate } from 'functions/updateExchangeRate'
import { useAsset } from 'hooks/data'
import useStore from 'store'
import { State } from 'types/enums'
import { QUERY_KEYS } from 'types/enums/queryKeys'

const poolsEndpoint = 'osmosis/gamm/v1beta1/pools/'

export const useSpotPrice = (symbol: string) => {
  const networkConfig = useStore((s) => s.networkConfig)
  const baseCurrency = networkConfig.assets.base
  const displayCurrency = networkConfig.displayCurrency
  const exchangeRates = useStore((s) => s.exchangeRates)
  const assetPricesUSD = useStore((s) => s.assetPricesUSD)
  const exchangeRatesState = useStore((s) => s.assetPricesUSDState)
  const basePriceState = useStore((s) => s.assetPricesUSDState)
  const asset = useAsset({ symbol })
  const lcd = networkConfig.restUrl ?? ''

  const poolBase = asset?.poolBase
    ? exchangeRates?.find((ratesAsset) => ratesAsset.denom === asset.poolBase)
    : true

  useQuery<PoolResponse>(
    [QUERY_KEYS.SPOT_PRICE, asset?.poolId],
    async () => {
      return fetch(`${lcd}${poolsEndpoint}${asset?.poolId}`).then(async (response) => {
        const data = await response.json()
        return data
      })
    },
    {
      enabled:
        !!asset &&
        !!asset.poolId &&
        !!poolBase &&
        basePriceState === State.READY &&
        exchangeRatesState === State.READY,
      staleTime: 30000,
      refetchInterval: 30000,
      onSuccess: (data) => {
        if (!asset || !assetPricesUSD) return
        const poolDataAssets = data.pool.pool_assets
        const assetFirst = poolDataAssets[0].token.denom === asset.denom
        const primaryAsset = poolDataAssets[assetFirst ? 0 : 1]
        const secondaryAsset = poolDataAssets[assetFirst ? 1 : 0]

        const primaryAssetAmount = new BigNumber(primaryAsset.token.amount)
        const primaryAssetWeight = new BigNumber(primaryAsset.weight)
        const secondaryAssetAmount = new BigNumber(secondaryAsset.token.amount)
        const secondaryAssetWeight = new BigNumber(secondaryAsset.weight)

        const rate = secondaryAssetAmount
          .div(primaryAssetAmount)
          .multipliedBy(secondaryAssetWeight.div(primaryAssetWeight))

        const hasDisplayCurrency = exchangeRates?.find(
          (ratesAsset) => ratesAsset.denom === displayCurrency.denom,
        )

        if (displayCurrency.denom === asset.denom && !hasDisplayCurrency) {
          const coinExchangeRate = { denom: asset.denom, amount: '1' }
          useStore.setState({
            exchangeRates: updateExchangeRate(coinExchangeRate, exchangeRates || []),
          })
        } else {
          const secondaryRate =
            exchangeRates?.find((rate) => rate.denom === secondaryAsset.token.denom)?.amount ?? 1
          const coinExchangeRate = {
            denom: asset.denom,
            amount: rate.times(secondaryRate).toString(),
          }

          if (typeof poolBase === 'object') {
            const baseRate = Number(rate.toString()) * Number(poolBase.amount)
            coinExchangeRate.amount = baseRate.toString()
            useStore.setState({
              exchangeRates: updateExchangeRate(coinExchangeRate, exchangeRates || []),
            })
          } else {
            useStore.setState({
              exchangeRates: updateExchangeRate(coinExchangeRate, exchangeRates || []),
            })
          }
          const baseCurrencyPrice = assetPricesUSD.find(
            (asset) => asset.denom === baseCurrency.denom,
          )?.amount
          if (!baseCurrencyPrice) return

          const assetPriceCoin = {
            denom: coinExchangeRate.denom,
            amount: new BigNumber(coinExchangeRate.amount).times(baseCurrencyPrice).toString(),
          }
          useStore.setState({
            assetPricesUSD: updateAssetPrices(assetPriceCoin, assetPricesUSD || []),
          })
        }
      },
    },
  )
}
