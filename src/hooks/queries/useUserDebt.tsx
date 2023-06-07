import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

const QUERY_LIMIT = 10

export interface UserDebtData {
  denom: string
  amount_scaled: string
  amount: string
  enabled: boolean
}

export const useUserDebt = () => {
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const redbankContractAddress = useStore((s) => s.networkConfig?.contracts.redBank)
  const client = useStore((s) => s.client)

  const resolveDebtResponse = (debts: UserDebtData[]): Coin[] => {
    return debts.map((debt) => {
      return {
        denom: debt.denom,
        amount: debt.amount,
      }
    })
  }

  const getDebts = async (contract: string, startAfter?: string): Promise<UserDebtData[]> => {
    if (!client) return []
    return client.cosmWasmClient.queryContractSmart(contract, {
      user_debts: {
        user: userWalletAddress,
        limit: QUERY_LIMIT,
        start_after: startAfter,
      },
    })
  }

  useQuery<Coin[]>(
    [QUERY_KEYS.USER_DEBT],
    async () => {
      let userDebts: Coin[] = []
      if (!redbankContractAddress) return userDebts

      let isMoreDebts = true

      while (isMoreDebts) {
        const debts = await getDebts(
          redbankContractAddress,
          userDebts[userDebts.length - 1]?.denom || '',
        )
        userDebts = userDebts.concat(resolveDebtResponse(debts))

        if (debts.length < QUERY_LIMIT) isMoreDebts = false
      }

      useStore.setState({ userDebts: userDebts })
      return userDebts
    },
    {
      enabled: !!redbankContractAddress && !!userWalletAddress && !!client,
      staleTime: 30000,
      refetchInterval: 30000,
    },
  )
}
