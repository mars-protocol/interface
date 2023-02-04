import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { updateExchangeRate } from 'functions/updateExchangeRate'
import { useAsset } from 'hooks/data'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

const poolsEndpoint = 'osmosis/gamm/v1beta1/pools/'

export const useSpotPrice = (symbol: string) => {
  const displayCurrency = useStore((s) => s.displayCurrency)
  const lcd = useStore((s) => s.chainInfo?.rest)
  const exchangeRates = useStore((s) => s.exchangeRates)

  const asset = useAsset({ symbol })

  useQuery<PoolResponse>(
    [QUERY_KEYS.MARS_PRICE, asset?.poolId],
    async () => {
      return fetch(`${lcd}${poolsEndpoint}${asset?.poolId}`).then(async (response) => {
        const data = await response.json()
        return data
      })
    },
    {
      enabled: !!lcd && !!asset && !!asset.poolId,
      staleTime: 30000,
      refetchInterval: 30000,
      onSuccess: (data) => {
        if (!asset) return
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

        if (displayCurrency.denom === asset.denom) {
          useStore.setState({ baseToDisplayCurrencyRatio: 1 / rate.toNumber() })
        } else {
          const coin = { denom: asset.denom, amount: rate.toString() }
          useStore.setState({ exchangeRates: updateExchangeRate(coin, exchangeRates || []) })
        }
      },
    },
  )
}
