import { useQuery } from '@tanstack/react-query'
import { getDepositDebtQuery } from 'functions/queries'
import { gql, request } from 'graphql-request'
import { useEffect } from 'react'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export interface DepositAndDebtData {
  mdwasmkey: {
    OSMODeposits: string
    OSMODebt: string
    ATOMDeposits: string
    ATOMDebt: string
    AXLDeposits: string
    AXLDebt: string
    JUNODeposits: string
    JUNODebt: string
    axlUSDCDeposits: string
    axlUSDCDebt: string
    nUSDCDeposits: string
    nUSDCDebt: string
    axlWBTCDeposits: string
    axlWBTCDebt: string
    axlWETHDeposits: string
    axlWETHDebt: string
    stATOMDeposits: string
    stATOMDebt: string
    NTRNDeposits: string
    NTRNDebt: string
  }
}

export const useDepositAndDebt = () => {
  const hiveUrl = useStore((s) => s.networkConfig.hiveUrl)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)
  const redBankAddress = useStore((s) => s.networkConfig.contracts.redBank) || ''
  const marketInfo = useStore((s) => s.marketInfo)
  const processDepositAndDebtQuery = useStore((s) => s.processDepositAndDebtQuery)

  const { refetch } = useQuery<DepositAndDebtData>(
    [QUERY_KEYS.MARKET_DEPOSITS],
    async () => {
      return await request(
        hiveUrl!,
        gql`
          ${getDepositDebtQuery(redBankAddress, whitelistedAssets, marketInfo)}
        `,
      )
    },
    {
      enabled: !!hiveUrl && !!whitelistedAssets.length && !!redBankAddress && !!marketInfo.length,
      refetchInterval: 120000,
      onSuccess: processDepositAndDebtQuery,
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
