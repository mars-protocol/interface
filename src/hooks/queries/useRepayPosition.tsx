import { getRepayActionsAndFunds, orderCoinsByDenom } from 'functions/fields'
import { useEffect, useMemo, useState } from 'react'

import { useEstimateFarmFee } from './useEstimateFarmFee'

interface Props {
  prevPosition: Position
  repayPosition: Position
  activeVault: ActiveVault
  isLoading: boolean
}

export const useRepayPosition = (props: Props) => {
  const [amount, setAmount] = useState(0)

  useEffect(() => {
    setAmount(props.prevPosition.amounts.borrowed - props.repayPosition.amounts.borrowed)
  }, [props.repayPosition.amounts.borrowed, props.prevPosition.amounts.borrowed])

  const [actions, funds] = useMemo(() => {
    if (!amount) return [[], []]
    return getRepayActionsAndFunds({
      denom: props.activeVault.denoms.secondary,
      amount: amount.toString(),
    })
  }, [amount, props.activeVault.denoms.secondary])

  const { data: fee } = useEstimateFarmFee({
    accountId: props.prevPosition.accountId,
    actions,
    funds: orderCoinsByDenom(funds),
    isCreate: false,
    isLoading: props.isLoading,
  })

  return { repayActions: actions, repayFunds: funds, repayFee: fee }
}
