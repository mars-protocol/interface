import { StdFee } from '@cosmjs/stargate'
import { useMutation } from '@tanstack/react-query'
import { parseActionMessages } from 'libs/parse'
import useStore from 'store'

export const useCreateCreditAccount = () => {
  const executeMsg = useStore((s) => s.executeMsg)
  const networkConfig = useStore((s) => s.networkConfig)

  return useMutation(async (fee: StdFee) => {
    const message = { create_credit_account: {} }

    if (!networkConfig) return null
    return executeMsg({
      msg: message,
      fee,
      contract: networkConfig.contracts.creditManager,
    }).then((broadcastResult) => {
      if (broadcastResult) {
        try {
          const messages = parseActionMessages(broadcastResult)

          return (
            messages?.find(
              (message: Record<string, string>) => message?.action === 'mint',
            ) as Record<string, string>
          )['token_id']
        } catch {}
      }
    })
  })
}
