import { useQuery } from '@tanstack/react-query'
import { getMarketDepositsQuery } from 'functions/queries'
import { gql, request } from 'graphql-request'
import { useEffect } from 'react'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export interface MarketDepositsData {
  mdwasmkey: {
    OSMODeposits: string
    ATOMDeposits: string
    JUNODeposits: string
  }
}

export const useMarketDeposits = () => {
  const hiveUrl = useStore((s) => s.networkConfig?.hiveUrl)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)
  const redBankAddress = useStore((s) => s.networkConfig?.contracts.redBank) || ''
  const marketInfo = useStore((s) => s.marketInfo)
  const processMarketDepositsQuery = useStore((s) => s.processMarketDepositsQuery)

  const { refetch } = useQuery<MarketDepositsData>(
    [QUERY_KEYS.MARKET_DEPOSITS],
    async () => {
      return await request(
        hiveUrl!,
        gql`
          ${getMarketDepositsQuery(redBankAddress, whitelistedAssets, marketInfo)}
        `,
      )
    },
    {
      enabled: !!hiveUrl && !!whitelistedAssets.length && !!redBankAddress && !!marketInfo.length,
      refetchInterval: 120000,
      onSuccess: processMarketDepositsQuery,
    },
  )

  // ! Workaround:
  // Invalidating this query in RB action somehow resolves to Zustand with outdated marketInfo data
  // It does not retrigger, and therefore a useEffect is placed here to manually rerun when the
  // marketInfo actually updates.
  useEffect(() => {
    if (!marketInfo.length) return
    refetch()
  }, [marketInfo, refetch])
}
