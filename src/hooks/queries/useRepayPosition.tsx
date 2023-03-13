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
    const borrowKey =
      props.prevPosition.borrowDenom === props.activeVault.denoms.primary
        ? 'borrowedPrimary'
        : 'borrowedSecondary'
    setAmount(props.prevPosition.amounts[borrowKey] - props.repayPosition.amounts[borrowKey])
  }, [
    props.repayPosition.amounts.borrowedPrimary,
    props.repayPosition.amounts.borrowedSecondary,
    props.prevPosition.amounts.borrowedPrimary,
    props.prevPosition.amounts.borrowedSecondary,
    props.activeVault.denoms.primary,
    props.prevPosition.amounts,
    props.prevPosition.borrowDenom,
    props.repayPosition.amounts,
  ])

  const [actions, funds] = useMemo(() => {
    if (!amount) return [[], []]
    return getRepayActionsAndFunds({
      denom: props.activeVault.position.borrowDenom || props.activeVault.denoms.secondary,
      amount: amount.toString(),
    })
  }, [amount, props.activeVault.denoms.secondary, props.activeVault.position.borrowDenom])

  const { data: fee } = useEstimateFarmFee({
    accountId: props.prevPosition.accountId,
    actions,
    funds: orderCoinsByDenom(funds),
    isCreate: false,
    isLoading: props.isLoading,
  })

  return { repayActions: actions, repayFunds: funds, repayFee: fee }
}
