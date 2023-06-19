import { WalletID, WalletManagerProvider } from '@marsprotocol/wallet-connector'
import { CircularProgress, SVG } from 'components/common'
import { SUPPORTED_CHAINS } from 'constants/appConstants'
import { getCurrentChainId } from 'libs/chainId'
import { useEffect } from 'react'
import useStore from 'store'

import styles from './CosmosWalletConnectProvider.module.scss'

type Props = {
  children?: React.ReactNode
}

export const CosmosWalletConnectProvider = ({ children }: Props) => {
  const currentNetwork = useStore((s) => s.currentNetwork)
  const setCurrentNetwork = useStore((s) => s.setCurrentNetwork)
  const loadNetworkConfig = useStore((s) => s.loadNetworkConfig)
  const networkConfig = useStore((s) => s.networkConfig)

  useEffect(() => {
    setCurrentNetwork(getCurrentChainId())
    loadNetworkConfig()
  }, [loadNetworkConfig, setCurrentNetwork])

  const supportedChains = SUPPORTED_CHAINS.map((chain) => chain.chainId)

  return (
    <WalletManagerProvider
      chainInfoOverrides={{
        rpc: networkConfig.rpcUrl,
        rest: networkConfig.restUrl,
      }}
      chainIds={supportedChains}
      closeIcon={<SVG.Close />}
      defaultChainId={currentNetwork}
      enabledWallets={[
        WalletID.Keplr,
        WalletID.Xdefi,
        WalletID.StationWallet,
        WalletID.Leap,
        WalletID.Cosmostation,
        WalletID.KeplrMobile,
        WalletID.CosmostationMobile,
      ]}
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
