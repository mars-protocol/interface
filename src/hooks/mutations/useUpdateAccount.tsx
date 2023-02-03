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
  const executeMsg = useStore((s) => s.executeMsg)
  const networkConfig = useStore((s) => s.networkConfig)
  const getVaults = useStore((s) => s.getVaults)

  return useMutation(async (props: Props) => {
    queryClient.removeQueries([QUERY_KEYS.ESTIMATE_FARM_FEE])
    const message = {
      update_credit_account: {
        account_id: props.accountId,
        actions: props.actions,
      },
    }

    if (!networkConfig) return

    return executeMsg({
      msg: message,
      fee: props.fee,
      contract: networkConfig.contracts.creditManager,
      funds: props.funds,
    }).then((broadcastResult) => {
      if (broadcastResult?.response.code === 0) {
        getVaults({ refetch: true })
        return { result: broadcastResult }
      } else {
        return { error: broadcastResult?.rawLogs }
      }
    })
  })
}
