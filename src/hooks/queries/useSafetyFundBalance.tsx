import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export interface SafetyFundBalanceData {
  balance: {
    balance: Coin[]
  }
}

export const useSafetyFundBalance = () => {
  const hiveUrl = useStore((s) => s.networkConfig?.hiveUrl)
  const safetyFundAddress = useStore((s) => s.addressProviderConfig?.safety_fund_address)
  const processSafetyFundQuery = useStore((s) => s.processSafetyFundQuery)

  useQuery<SafetyFundBalanceData>(
    [QUERY_KEYS.SAFETY_FUND_BALANCE],
    async () => {
      return await request(
        hiveUrl!,
        gql`
                    query SafetyFundBalanceQuery {
                            balance: bank {
                                balance(
                                    address: "${safetyFundAddress}"
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
      enabled: !!hiveUrl && !!safetyFundAddress,
      refetchInterval: 30000,
      onSuccess: processSafetyFundQuery,
    },
  )
}
