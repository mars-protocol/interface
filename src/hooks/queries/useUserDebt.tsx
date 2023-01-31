import { useQuery } from '@tanstack/react-query'
import { getContractQuery, getDebtQuery } from 'functions/queries'
import { gql, request } from 'graphql-request'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export interface UserDebtData {
  debts: {
    debts: [
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
export const useUserDebt = () => {
  const hiveUrl = useStore((s) => s.networkConfig?.hiveUrl)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const redbankContractAddress = useStore((s) => s.networkConfig?.contracts.redBank)
  const processUserDebtQuery = useStore((s) => s.processUserDebtQuery)

  const debtsQuery = getContractQuery(
    'debts',
    redbankContractAddress || '',
    getDebtQuery(userWalletAddress),
  )

  useQuery<UserDebtData>(
    [QUERY_KEYS.USER_DEBT],
    async () => {
      return await request(
        hiveUrl!,
        gql`
          query UserDebtQuery {
              debts: wasm {
                  ${debtsQuery}
              }
          }
      `,
      )
    },
    {
      enabled:
        !!hiveUrl && !!redbankContractAddress && !!processUserDebtQuery && !!userWalletAddress,
      staleTime: 30000,
      refetchInterval: 30000,
      onSuccess: processUserDebtQuery,
    },
  )
}
