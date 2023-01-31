import { ChainInfoID, WalletManagerProvider, WalletType } from '@marsprotocol/wallet-connector'
import { CircularProgress, SVG } from 'components/common'
import buttonStyles from 'components/common/Button/Button.module.scss'
import { NETWORK_CONFIG } from 'configs/osmo-test-4'
import { SESSION_WALLET_KEY } from 'constants/appConstants'
import KeplrImage from 'images/keplr-wallet-extension.png'
import WalletConnectImage from 'images/walletconnect-keplr.png'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './CosmosWalletConnectProvider.module.scss'

type Props = {
  children?: React.ReactNode
}

export const CosmosWalletConnectProvider: FC<Props> = ({ children }) => {
  const { t } = useTranslation()
  const chainId = useStore((s) => s.currentNetwork)

  return (
    <WalletManagerProvider
      chainInfoOverrides={{
        [ChainInfoID.OsmosisTestnet]: {
          rpc: NETWORK_CONFIG.rpcUrl,
          rest: NETWORK_CONFIG.restUrl,
        },
      }}
      classNames={{
        modalContent: styles.content,
        modalOverlay: styles.overlay,
        modalHeader: styles.header,
        modalCloseButton: styles.close,
        walletList: styles.list,
        wallet: styles.wallet,
        walletImage: styles.image,
        walletInfo: styles.info,
        walletName: styles.name,
        walletDescription: styles.description,
        textContent: styles.text,
      }}
      closeIcon={<SVG.Close />}
      defaultChainId={chainId}
      enabledWalletTypes={[WalletType.Keplr, WalletType.WalletConnectKeplr]}
      enablingMeta={{
        text: <Trans i18nKey='global.walletResetText' />,
        textClassName: styles.text,
        buttonText: <Trans i18nKey='global.walletReset' />,
        buttonClassName: ` ${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.small} ${buttonStyles.solid} ${styles.button}`,
        contentClassName: styles.enableContent,
      }}
      enablingStringOverride={t('global.connectingToWallet')}
      localStorageKey={SESSION_WALLET_KEY}
      renderLoader={() => (
        <div className={styles.loader}>
          <CircularProgress size={30} />
        </div>
      )}
      walletConnectClientMeta={{
        name: 'Mars Protocol',
        description:
          'Lend, borrow and earn on the galaxy`s most powerful credit protocol or enter the Fields of Mars for advanced DeFi strategies.',
        url: 'https://marsprotocol.io',
        icons: ['https://marsprotocol.io/favicon.svg'],
      }}
      walletMetaOverride={{
        [WalletType.Keplr]: {
          description: <Trans i18nKey='global.keplrBrowserExtension' />,
          imageUrl: KeplrImage.src,
        },
        [WalletType.WalletConnectKeplr]: {
          name: <Trans i18nKey='global.walletConnect' />,
          description: <Trans i18nKey='global.walletConnectDescription' />,
          imageUrl: WalletConnectImage.src,
        },
      }}
    >
      {children}
    </WalletManagerProvider>
  )
}
