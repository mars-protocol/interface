import { ChainInfoID, WalletID, WalletManagerProvider } from '@marsprotocol/wallet-connector'
import { CircularProgress, SVG } from 'components/common'
import { NETWORK } from 'constants/env'
import { useEffect, useState } from 'react'

import styles from './CosmosWalletConnectProvider.module.scss'

type Props = {
  children?: React.ReactNode
}

export const CosmosWalletConnectProvider = ({ children }: Props) => {
  const [chainInfoOverrides, setChainInfoOverrides] = useState<{
    rpc: string
    rest: string
    chainID: ChainInfoID
  }>()
  const [enabledWallets, setEnabledWallets] = useState<WalletID[]>([])

  useEffect(() => {
    if (chainInfoOverrides) return

    const fetchConfig = async () => {
      const file = await import(`../../../configs/${NETWORK !== 'mainnet' ? 'osmo-test-4' : 'osmosis-1'}.ts`)

      const networkConfig: NetworkConfig = file.NETWORK_CONFIG

      setChainInfoOverrides({
        rpc: networkConfig.rpcUrl,
        rest: networkConfig.restUrl,
        chainID: networkConfig.name,
      })
      setEnabledWallets(networkConfig.wallets)
    }

    fetchConfig()
  })

  if (!chainInfoOverrides || !enabledWallets?.length) return null

  return (
    <WalletManagerProvider
      chainInfoOverrides={chainInfoOverrides}
      closeIcon={<SVG.Close />}
      defaultChainId={chainInfoOverrides.chainID}
      enabledWallets={enabledWallets}
      persistent
      renderLoader={() => (
        <div className={styles.loader}>
          <CircularProgress size={30} />
        </div>
      )}
    >
      {children}
    </WalletManagerProvider>
  )
}
