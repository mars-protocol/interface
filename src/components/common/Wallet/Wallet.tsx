import { useQueryClient } from '@tanstack/react-query'
import { WalletConnectButton, WalletConnectedButton } from 'components/common'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import { useEffect } from 'react'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'

export const Wallet = () => {
  const currentWallet = useCurrentWallet()
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!currentWallet) return
    if (currentWallet.account.address === userWalletAddress) return
    queryClient.removeQueries()
    useStore.setState({
      userWalletAddress: undefined,
      client: undefined,
      chainInfo: undefined,
      walletConnecting: { show: true, providerId: currentWallet.providerId as WalletID },
    })
  }, [currentWallet, userWalletAddress, queryClient])

  return userWalletAddress ? <WalletConnectedButton /> : <WalletConnectButton />
}
