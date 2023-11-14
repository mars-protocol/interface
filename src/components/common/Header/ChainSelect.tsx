import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import { Button } from 'components/common'
import { CHAIN_ID_KEY, SUPPORTED_CHAINS } from 'constants/appConstants'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import { getNetworkConfig } from 'libs/networkConfig'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { State } from 'types/enums'
import { ChainInfoID, WalletID } from 'types/enums/wallet'

import styles from './ChainSelect.module.scss'

interface Chain {
  chainId: ChainInfoID
  type: 'testnet' | 'mainnet'
}

interface ChainList {
  chains: Chain[]
  currentNetwork: ChainInfoID
  handleChainSelect: (chainId: ChainInfoID) => void
}

function ChainList({ chains, currentNetwork, handleChainSelect }: ChainList) {
  return (
    <div className={styles.chains}>
      {chains.map((chain) => {
        const { chainId } = chain
        const nc = getNetworkConfig(chainId)
        return (
          <div
            key={chainId}
            className={classNames(styles.chain, chainId === currentNetwork && styles.active)}
            onClick={() => handleChainSelect(chainId)}
            role='button'
          >
            <div className={styles.image}>
              <Image src={nc.chainIcon} height={24} width={24} alt={nc.name} />
            </div>
            <div className={styles.description}>
              <p className='sCaps'>{nc.displayName}</p>
              <p className={styles.chainId}>{chainId}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const ChainSelect = () => {
  const networkConfig = useStore((s) => s.networkConfig)
  const currentNetwork = useStore((s) => s.currentNetwork)
  const loadNetworkConfig = useStore((s) => s.loadNetworkConfig)
  const currentWallet = useCurrentWallet()

  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)

  function handleChainSelect(chainId: ChainInfoID) {
    useStore.setState({
      userWalletAddress: undefined,
      currentNetwork: chainId,
      exchangeRates: [],
      assetPricesUSD: [],
      marketAssetLiquidity: [],
      marketInfo: [],
      userIcns: undefined,
      redBankAssets: [],
      userUnclaimedRewards: [],
      networkConfig: getNetworkConfig(chainId),
      redBankState: State.INITIALISING,
      userBalancesState: State.INITIALISING,
      migrationInProgress: false,
      pythVaa: {
        priceFeeds: [],
        data: [],
      },
      walletConnecting: { show: true, providerId: currentWallet?.providerId as WalletID },
    })
    loadNetworkConfig()
    localStorage.setItem(CHAIN_ID_KEY, chainId)
    queryClient.removeQueries()
    setShowMenu(false)
  }

  const mainnets: Chain[] = SUPPORTED_CHAINS.filter((chain) => chain.type === 'mainnet')
  const testnets: Chain[] = SUPPORTED_CHAINS.filter((chain) => chain.type === 'testnet')

  return (
    <div className={styles.container}>
      <Button
        className={styles.button}
        variant='round'
        color='tertiary'
        suffix={
          <Image src={networkConfig.chainIcon} height={20} width={20} alt={networkConfig.name} />
        }
        onClick={() => setShowMenu(true)}
      />
      {showMenu && (
        <>
          <div className={styles.menu}>
            <div className={styles.header}>
              <p className={styles.text}>{t('common.selectChain')}</p>
            </div>
            <ChainList
              chains={mainnets}
              currentNetwork={currentNetwork}
              handleChainSelect={handleChainSelect}
            />
            <div className={styles.subheader}>{t('common.testnet')}</div>{' '}
            <ChainList
              chains={testnets}
              currentNetwork={currentNetwork}
              handleChainSelect={handleChainSelect}
            />
          </div>
          <div className={styles.clickAway} onClick={() => setShowMenu(false)} role='button' />
        </>
      )}
    </div>
  )
}
