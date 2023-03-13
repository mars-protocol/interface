import { useQuery } from '@tanstack/react-query'
import { updateExchangeRate } from 'functions'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

interface CoinPriceData {
  price: number
  denom: string
  symbol: string
  liquidity: number
  liquidity_24h_change: number
  volume_24h: number
  volume_24h_change: number
  name: string
  price_24h_change: number
  exponent: number
  display: string
}

export const useUsdPrice = () => {
  const apiUrl = useStore((s) => s.networkConfig?.priceApiUrl ?? '')
  const exchangeRates = useStore((s) => s.exchangeRates ?? [])
  const networkConfig = useStore((s) => s.networkConfig)
  const displayCurrency = networkConfig?.displayCurrency

  useQuery<CoinPriceData[]>(
    [QUERY_KEYS.USD_PRICE],
    async () => {
      const res = await fetch(apiUrl)
      return res.json()
    },
    {
      enabled: !!apiUrl && !!exchangeRates.length && !!displayCurrency,
      staleTime: 30000,
      refetchInterval: 30000,
      onSuccess: (data) => {
        const coin = { denom: 'usd', amount: (1 / data[0].price).toString() }
        if (displayCurrency.denom === coin.denom) {
          useStore.setState({ baseToDisplayCurrencyRatio: data[0].price })
        }

        updateExchangeRate(coin, exchangeRates)
      },
    },
  )
}
