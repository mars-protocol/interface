import { useQuery } from '@tanstack/react-query'
import { getContractQuery, getDepositsQuery } from 'functions/queries'
import { gql, request } from 'graphql-request'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export interface UserDepositData {
  deposits: {
    deposits:
      | [
          {
            denom: string
            amount_scaled: string
            amount: string
            enabled: boolean
          },
        ]
  }
}

// ! Implement pagination. Currently there is a limit of 5 assets from the SC

export const useUserDeposit = () => {
  const hiveUrl = useStore((s) => s.networkConfig?.hiveUrl)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)
  const redbankContractAddress = useStore((s) => s.networkConfig?.contracts.redBank)
  const processUserDepositQuery = useStore((s) => s.processUserDepositQuery)

  useQuery<UserDepositData>(
    [QUERY_KEYS.USER_DEPOSIT],
    async () => {
      return await request(
        hiveUrl!,
        gql`
                    query UserDepositQuery {
                        deposits: wasm {
                            ${getContractQuery(
                              'deposits',
                              redbankContractAddress || '',
                              getDepositsQuery(userWalletAddress),
                            )}
                        }
                    }
                `,
      )
    },
    {
      enabled: !!hiveUrl && !!redbankContractAddress && !!whitelistedAssets && !!userWalletAddress,
      staleTime: 30000,
      refetchInterval: 30000,
      onSuccess: processUserDepositQuery,
    },
  )
}
