import { useWalletManager, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { ConnectButton, ConnectedButton } from 'components/common'

export const Connect = () => {
  const { status, connectedWallet } = useWalletManager()

  if (status === WalletConnectionStatus.Connected && connectedWallet) return <ConnectedButton />

  return <ConnectButton />
}
