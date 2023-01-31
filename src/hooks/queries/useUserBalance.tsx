import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import { useMemo } from 'react'
import useStore from 'store'

export interface UserBalanceData {
  balance: {
    balance: Coin[]
  }
}

export const useUserBalance = () => {
  const hiveUrl = useStore((s) => s.networkConfig?.hiveUrl)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const processUserBalanceQuery = useStore((s) => s.processUserBalanceQuery)

  const result = useQuery<UserBalanceData>(
    [],
    async () => {
      return await request(
        hiveUrl!,
        gql`
                    query UserBalanceQuery {
                            balance: bank {
                                balance(
                                    address: "${userWalletAddress}"
                                ) {
                                    amount
                                    denom
                                }
                            }
                    }
                `,
      )
    },
    {
      enabled: (!!hiveUrl && !!userWalletAddress) || false,
      staleTime: 30000,
      refetchInterval: 30000,
      onSuccess: processUserBalanceQuery,
    },
  )

  return {
    ...result,
    data: useMemo(() => result.data && result.data.balance.balance, [result.data]),
  }
}
