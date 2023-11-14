import { Coin } from '@cosmjs/proto-signing'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { updateAssetPrices } from 'functions/updateAssetPrices'
import useStore from 'store'
import { State } from 'types/enums'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export const useUsdPrice = () => {
  let usdPriceUrl = useStore((s) => s.networkConfig.usdPriceUrl)
  let hasPriceFeeds = false
  const whitelistedAssets = useStore((s) => s.networkConfig.assets.whitelist)
  const otherAssets = useStore((s) => s.networkConfig.assets.other)
  const assetPricesUSD = useStore((s) => s.assetPricesUSD ?? [])
  const basePriceState = useStore((s) => s.basePriceState)
  const baseAsset = useStore((s) => s.networkConfig.assets.base)

  const assets = [...whitelistedAssets, ...otherAssets]

  if (!usdPriceUrl && basePriceState !== State.READY)
    useStore.setState({ basePriceState: State.READY })

  if (usdPriceUrl && assets) {
    const pythApiUrl = new URL(usdPriceUrl + 'latest_price_feeds')
    assets.forEach((asset) => {
      if (asset.priceFeedId) {
        hasPriceFeeds = true
        pythApiUrl.searchParams.append('ids[]', asset.priceFeedId)
      }
    })
    usdPriceUrl = pythApiUrl.href
  }

  useQuery<CoinPriceData[]>(
    [QUERY_KEYS.USD_PRICE],
    async () => {
      if (!usdPriceUrl || !assets || !hasPriceFeeds) return
      const res = await fetch(usdPriceUrl)
      return res.json()
    },
    {
      enabled: !!usdPriceUrl || !!assets,
      staleTime: 30000,
      refetchInterval: 30000,
      onSuccess: (data) => {
        let updatedAssetPricesUSD: Coin[] = []
        data.map((priceData) => {
          const denom = assets.find((asset) => asset?.priceFeedId === priceData.id)?.denom

          if (denom) {
            const amount = new BigNumber(priceData.price.price)
              .times(new BigNumber(10).pow(priceData.price.expo))
              .toString()

            const coin = { denom, amount }

            updatedAssetPricesUSD = updateAssetPrices(coin, assetPricesUSD, true)
            if (denom === baseAsset?.denom) {
              useStore.setState({
                basePriceState: State.READY,
              })
            }
          }
        })
        useStore.setState({ assetPricesUSD: updatedAssetPricesUSD })
      },
    },
  )
}
