import { useWalletManager, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { ConnectButton, ConnectedButton } from 'components/common'

export const Connect = () => {
  const { status } = useWalletManager()

  if (status === WalletConnectionStatus.Connected) return <ConnectedButton />

  return <ConnectButton />
}
