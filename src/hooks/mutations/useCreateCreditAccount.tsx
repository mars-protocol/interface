import { StdFee } from '@cosmjs/stargate'
import { useMutation } from '@tanstack/react-query'
import useStore from 'store'

export const useCreateCreditAccount = () => {
  const creditManagerClient = useStore((s) => s.creditManagerClient)

  return useMutation(async (fee: StdFee) => {
    const executeResult = await creditManagerClient?.createCreditAccount(fee)
    return executeResult?.logs[0].events[2].attributes[6].value
  })
}
