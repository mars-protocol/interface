import { useQuery } from '@tanstack/react-query'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export const usePythVaa = () => {
  let pythVaaUrl = useStore((s) => s.networkConfig.usdPriceUrl)
  const pythVaa = useStore((s) => s.pythVaa)
  const hasPriceFeeds = pythVaa.priceFeeds.length > 0

  if (pythVaaUrl && hasPriceFeeds) {
    const pythApiUrl = new URL(pythVaaUrl + 'latest_vaas')
    pythVaa.priceFeeds.forEach((priceFeedId) => {
      pythApiUrl.searchParams.append('ids[]', priceFeedId)
    })
    pythVaaUrl = pythApiUrl.href
  }

  useQuery<string[]>(
    [QUERY_KEYS.PYTH_VAA],
    async () => {
      if (!pythVaaUrl || !hasPriceFeeds) return
      const res = await fetch(pythVaaUrl)
      return res.json()
    },
    {
      enabled: hasPriceFeeds && !!pythVaaUrl,
      staleTime: 30000,
      refetchInterval: 30000,
      onSuccess: (data) => {
        useStore.setState({
          pythVaa: {
            priceFeeds: pythVaa.priceFeeds,
            data,
          },
        })
      },
    },
  )
}
