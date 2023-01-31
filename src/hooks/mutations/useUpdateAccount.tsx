import { StdFee } from '@cosmjs/stargate'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'
import { Action, Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

interface Props {
  accountId: string
  actions: Action[]
  fee: StdFee
  funds: Coin[]
}

export const useUpdateAccount = () => {
  const queryClient = useQueryClient()
  const creditManagerClient = useStore((s) => s.creditManagerClient)
  const getVaults = useStore((s) => s.getVaults)

  return useMutation(
    async (props: Props) => {
      queryClient.removeQueries([QUERY_KEYS.ESTIMATE_FARM_FEE])
      return creditManagerClient?.updateCreditAccount(
        {
          accountId: props.accountId,
          actions: props.actions,
        },
        props.fee,
        undefined,
        props.funds,
      )
    },
    {
      onSuccess: () => {
        getVaults({ refetch: true })
      },
      onError: (error: Error) => {
        return `${error.message}`
      },
    },
  )
}
