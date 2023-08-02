import { useQuery } from '@tanstack/react-query'
import { getRedbankQuery } from 'functions/queries'
import { gql, request } from 'graphql-request'
import useStore from 'store'
import { State } from 'types/enums'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export const useRedBank = () => {
  const networkConfig = useStore((s) => s.networkConfig)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)
  const processRedBankQuery = useStore((s) => s.processRedBankQuery)
  const setRedBankState = useStore((s) => s.setRedBankState)

  const hiveUrl = networkConfig.hiveUrl
  const redbankAddress = networkConfig.contracts.redBank
  const incentivesAddress = networkConfig.contracts.incentives
  const hasMultiAssetIncentives = networkConfig.hasMultiAssetIncentives

  useQuery<RedBankData>(
    [QUERY_KEYS.REDBANK],
    async () =>
      await request(
        hiveUrl!,
        gql`
          ${getRedbankQuery(
            userWalletAddress,
            redbankAddress,
            incentivesAddress,
            !!hasMultiAssetIncentives,
            whitelistedAssets,
          )}
        `,
      ),
    {
      enabled: !!userWalletAddress && !!whitelistedAssets?.length,
      staleTime: 30000,
      refetchInterval: 30000,
      onError: () => setRedBankState(State.ERROR),
      onSuccess: (data) => {
        processRedBankQuery(data, whitelistedAssets!)
      },
    },
  )
}
