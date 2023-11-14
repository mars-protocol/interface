import { useShuttle } from '@delphi-labs/shuttle-react'
import { useMemo } from 'react'
import useStore from 'store'

export default function useCurrentWallet() {
  const { wallets } = useShuttle()
  const chainId = useStore((s) => s.networkConfig.name)

  return useMemo(() => {
    return wallets.find((wallet) => wallet.network.chainId === chainId)
  }, [wallets, chainId])
}
