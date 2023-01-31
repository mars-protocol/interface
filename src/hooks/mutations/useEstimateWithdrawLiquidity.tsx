import { useMutation } from '@tanstack/react-query'
import useStore from 'store'
import { Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

interface Props {
  lpToken: Coin
}

export const useEstimateWithdrawLiquidity = () => {
  const creditManagerClient = useStore((s) => s.creditManagerClient)

  return useMutation(async (props: Props) =>
    creditManagerClient?.estimateWithdrawLiquidity({
      lpToken: props.lpToken,
    }),
  )
}
