import { useMemo } from 'react'
import useStore from 'store'

export const useAvailableVault = (address: string) => {
  const availableVaults = useStore((s) => s.availableVaults)
  return useMemo(() => {
    if (!availableVaults?.length) return
    return availableVaults.find((availableVault) => availableVault.address === address)
  }, [availableVaults, address])
}
