import { getRequestUnlockActions } from 'functions/fields'
import { useMemo } from 'react'

import { useEstimateFarmFee } from './useEstimateFarmFee'

interface Props {
  activeVault?: ActiveVault
  isLoading: boolean
}

export const useRequestUnlockPosition = (props: Props) => {
  const actions = useMemo(() => {
    if (!props.activeVault?.position.amounts.vault) return []
    return getRequestUnlockActions(
      props.activeVault.position.amounts.vault,
      props.activeVault.address,
    )
  }, [props.activeVault?.position.amounts.vault, props.activeVault?.address])

  const { data: fee } = useEstimateFarmFee({
    accountId: props.activeVault?.position.accountId,
    actions,
    funds: [],
    isCreate: false,
    isLoading: props.isLoading,
  })

  return { unlockActions: actions, unlockFee: fee }
}
