import { useMemo } from 'react'
import useStore from 'store'

export const useActiveVault = (accountId: string) => {
  const activeVaults = useStore((s) => s.activeVaults)

  return useMemo(() => {
    if (!activeVaults?.length) return
    return activeVaults.find((activeVault) => activeVault.position.accountId === accountId)
  }, [activeVaults, accountId])
}
