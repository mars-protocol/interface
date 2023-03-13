import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { updateExchangeRate } from 'functions/updateExchangeRate'
import { useAsset } from 'hooks/data'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

const poolsEndpoint = 'osmosis/gamm/v1beta1/pools/'

export const useSpotPrice = (symbol: string) => {
  const networkConfig = useStore((s) => s.networkConfig)
  const displayCurrency = networkConfig?.displayCurrency
  const lcd = useStore((s) => s.chainInfo?.rest)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const asset = useAsset({ symbol })
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
      enabled: !!lcd && !!asset && !!asset.poolId && !!poolBase,
      staleTime: 30000,
      refetchInterval: 30000,
      onSuccess: (data) => {
        if (!asset || !displayCurrency) return
        const poolDataAssets = data.pool.pool_assets
        const assetFirst = poolDataAssets[0].token.denom === asset.denom
        const targetAsset = poolDataAssets[assetFirst ? 0 : 1]
        const otherAsset = poolDataAssets[assetFirst ? 1 : 0]

        const targetAssetAmount = new BigNumber(targetAsset.token.amount)
        const targetAssetWeight = new BigNumber(targetAsset.weight)
        const otherAssetAmount = new BigNumber(otherAsset.token.amount)
        const otherAssetWeight = new BigNumber(otherAsset.weight)

        const rate = otherAssetAmount
          .div(targetAssetAmount)
          .multipliedBy(otherAssetWeight.div(targetAssetWeight))

        const hasDisplayCurrency = exchangeRates?.find(
          (ratesAsset) => ratesAsset.denom === displayCurrency.denom,
        )

        if (displayCurrency.denom === asset.denom && !hasDisplayCurrency) {
          useStore.setState({ baseToDisplayCurrencyRatio: 1 / rate.toNumber() })
        } else {
          const coin = { denom: asset.denom, amount: rate.toString() }

          if (typeof poolBase === 'object') {
            const baseRate = Number(rate.toString()) * Number(poolBase.amount)
            coin.amount = baseRate.toString()
            useStore.setState({ exchangeRates: updateExchangeRate(coin, exchangeRates || []) })
          } else {
            useStore.setState({ exchangeRates: updateExchangeRate(coin, exchangeRates || []) })
          }
        }
      },
    },
  )
}
