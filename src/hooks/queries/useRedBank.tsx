import { useQuery } from '@tanstack/react-query'
import { getRedbankQuery } from 'functions/queries'
import { gql, request } from 'graphql-request'
import useStore from 'store'
import { State } from 'types/enums'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export const useRedBank = () => {
  const hiveUrl = useStore((s) => s.networkConfig.hiveUrl)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)
  const redbankAddress = useStore((s) => s.networkConfig.contracts.redBank)
  const incentivesAddress = useStore((s) => s.networkConfig.contracts.incentives)
  const processRedBankQuery = useStore((s) => s.processRedBankQuery)
  const setRedBankState = useStore((s) => s.setRedBankState)

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
