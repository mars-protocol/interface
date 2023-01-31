import { useMemo } from 'react'
import useStore from 'store'

export const useActiveVault = (address: string) => {
  const activeVaults = useStore((s) => s.activeVaults)

  return useMemo(() => {
    if (!activeVaults?.length) return
    return activeVaults.find((activeVault) => activeVault.address === address)
  }, [activeVaults, address])
}
