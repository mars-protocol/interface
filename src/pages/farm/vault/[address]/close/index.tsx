import { ClosePositionResponse } from 'components/fields'
import { useActiveVault } from 'hooks/data'
import { useUpdateAccount } from 'hooks/mutations'
import { useClosePosition } from 'hooks/queries/useClosePosition'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import useStore from 'store'

const CloseVaultPosition = () => {
  const router = useRouter()
  const vaultConfigs = useStore((s) => s.vaultConfigs)
  const { mutate, data, isLoading, error } = useUpdateAccount()
  const vaultAddress = String(router.query.address)
  const activeVault = useActiveVault(vaultAddress)
  const { closeActions, closeFee } = useClosePosition({
    activeVault,
    isLoading: isLoading || !!data || !!error,
  })
  const isValidVault = vaultConfigs.find((vault) => vault.address === vaultAddress)

  const ref = useRef(activeVault)

  if (!ref.current && activeVault) {
    ref.current = activeVault
  }

  useEffect(() => {
    if (!closeFee || !closeActions || !activeVault || isLoading || data || error) return
    mutate({
      accountId: activeVault.position.accountId,
      actions: closeActions,
      fee: closeFee,
      funds: [],
    })
  }, [activeVault, closeActions, closeFee, mutate, isLoading, data, error])

  if (
    !ref.current ||
    !isValidVault ||
    (activeVault && activeVault.position.status !== 'unlocked')
  ) {
    router.replace('/farm')
    return
  }

  return (
    <ClosePositionResponse
      data={data}
      error={error}
      isLoading={isLoading}
      accountId={ref.current.position.accountId}
    />
  )
}

export default CloseVaultPosition
