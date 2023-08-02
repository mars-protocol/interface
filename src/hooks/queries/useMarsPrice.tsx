import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { updateAssetPrices } from 'functions/updateAssetPrices'
import { updateExchangeRate } from 'functions/updateExchangeRate'
import { useAsset } from 'hooks/data'
import useStore from 'store'
import { State } from 'types/enums'
import { QUERY_KEYS } from 'types/enums/queryKeys'

const poolsEndpoint = `${process.env.NEXT_PUBLIC_OSMOSIS_REST}osmosis/gamm/v1beta1/pools/`

export const useMarsPrice = () => {
  const networkConfig = useStore((s) => s.networkConfig)
  const displayCurrency = networkConfig.displayCurrency
  const exchangeRates = useStore((s) => s.exchangeRates)
  const assetPricesUSD = useStore((s) => s.assetPricesUSD)
  const exchangeRatesState = useStore((s) => s.assetPricesUSDState)
  const asset = useAsset({ symbol: 'MARS' })
  const marsOsmosDenom = 'ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580'
  const marsPoolId = 907

  useQuery<PoolResponse>(
    [QUERY_KEYS.SPOT_PRICE, marsPoolId],
    async () => {
      return fetch(`${poolsEndpoint}${marsPoolId}`).then(async (response) => {
        const data = await response.json()
        return data
      })
    },
    {
      enabled: !!asset && exchangeRatesState === State.READY,
      staleTime: 30000,
      refetchInterval: 30000,
      onSuccess: (data) => {
        if (!asset || !assetPricesUSD) return
        const poolDataAssets = data.pool.pool_assets
        const assetFirst = poolDataAssets[0].token.denom === marsOsmosDenom
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

          useStore.setState({
            exchangeRates: updateExchangeRate(coinExchangeRate, exchangeRates || []),
          })

          const secondaryAssetPrice = assetPricesUSD.find(
            (asset) => asset.denom === secondaryAsset.token.denom,
          )?.amount
          if (!secondaryAssetPrice) return

          const assetPriceCoin = {
            denom: coinExchangeRate.denom,
            amount: new BigNumber(coinExchangeRate.amount).times(secondaryAssetPrice).toString(),
          }

          useStore.setState({
            assetPricesUSD: updateAssetPrices(assetPriceCoin, assetPricesUSD || []),
            marsPriceState: State.READY,
          })
        }
      },
    },
  )
}
