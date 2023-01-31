import { useWallet, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { ConnectButton, ConnectedButton } from 'components/common'

export const Connect = () => {
  const { status } = useWallet()

  if (status === WalletConnectionStatus.Connected) return <ConnectedButton />

  return <ConnectButton />
}
