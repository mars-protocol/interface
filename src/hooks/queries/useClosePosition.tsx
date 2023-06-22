import { getClosePositionActions } from 'functions/fields'
import { useMemo } from 'react'
import useStore from 'store'

import { useEstimateFarmFee } from './useEstimateFarmFee'

interface Props {
  activeVault?: ActiveVault
  isLoading: boolean
}

export const useClosePosition = (props: Props) => {
  const getExchangeRate = useStore((s) => s.getExchangeRate)
  const slippage = useStore((s) => s.slippage)

  const actions = useMemo(() => {
    if (!props.activeVault) return []
    const primaryToSecondaryRate = getExchangeRate(
      props.activeVault.denoms.primary,
      props.activeVault.denoms.secondary,
    )
    return getClosePositionActions(props.activeVault, primaryToSecondaryRate, slippage)
  }, [props.activeVault, getExchangeRate, slippage])

  const { data: fee } = useEstimateFarmFee({
    accountId: props.activeVault?.position.accountId,
    actions,
    funds: [],
    isLoading: props.isLoading,
  })

  return { closeActions: actions, closeFee: fee }
}
