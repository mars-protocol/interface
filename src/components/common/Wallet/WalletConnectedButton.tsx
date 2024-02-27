import { useShuttle } from '@delphi-labs/shuttle-react'
import BigNumber from 'bignumber.js'
import { AnimatedNumber, Button, CircularProgress, DisplayCurrency, SVG } from 'components/common'
import { SUPPORTED_CHAINS } from 'constants/appConstants'
import { CHAINS } from 'constants/chains'
import { findByDenom } from 'functions'
import { useUserBalance } from 'hooks/queries'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import { formatValue } from 'libs/parse'
import { truncate } from 'libs/text'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useClipboard from 'react-use-clipboard'
import useStore from 'store'
import colors from 'styles/_assets.module.scss'
import { State } from 'types/enums'
import { ChainInfoID } from 'types/enums/wallet'

import styles from './WalletConnectedButton.module.scss'

export const WalletConnectedButton = () => {
  // ---------------
  // EXTERNAL HOOKS
  // ---------------
  const currentWallet = useCurrentWallet()
  const chainInfo = useStore((s) => s.chainInfo)
  const { disconnectWallet } = useShuttle()
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const baseCurrency = useStore((s) => s.baseCurrency)
  const network = useStore((s) => s.client?.connectedWallet.network)
  const networkConfig = useStore((s) => s.networkConfig)
  const [isTestnet, setIsTestnet] = useState(false)
  const userIcns = useStore((s) => s.userIcns)
  const { data: walletBalances, isLoading } = useUserBalance()
  const { t } = useTranslation()
  const baseAsset = useMemo(() => networkConfig.assets.base, [networkConfig])

  // ---------------
  // LOCAL STATE
  // ---------------
  const [showDetails, setShowDetails] = useState(false)
  const [walletAmount, setWalletAmount] = useState(new BigNumber(0))
  const [isCopied, setCopied] = useClipboard(userWalletAddress, {
    successDuration: 1000 * 5,
  })
  // ---------------
  // VARIABLES
  // ---------------
  const explorerName = network && CHAINS[network.chainId as ChainInfoID].explorerName

  const viewOnFinder = useCallback(() => {
    const explorerUrl = network && CHAINS[network.chainId as ChainInfoID].explorer

    window.open(`${explorerUrl}/account/${userWalletAddress}`, '_blank')
  }, [network, userWalletAddress])

  const onDisconnectWallet = () => {
    if (currentWallet) disconnectWallet(currentWallet)

    useStore.setState({
      client: undefined,
      userWalletAddress: undefined,
      chainInfo: undefined,
      userIcns: undefined,
      marketAssetLiquidity: [],
      marketInfo: [],
      redBankAssets: [],
      redBankState: State.INITIALISING,
      userBalancesState: State.INITIALISING,
    })
  }

  const onClickAway = useCallback(() => {
    setShowDetails(false)
  }, [])

  useEffect(() => {
    if (!chainInfo) return
    setIsTestnet(
      !!SUPPORTED_CHAINS.find(
        (chain) => chain.type === 'testnet' && chain.chainId === networkConfig.name,
      ),
    )
  }, [chainInfo, networkConfig.name])

  useEffect(() => {
    if (!walletBalances) return
    const newAmount = BigNumber(
      walletBalances.find((coin: Coin) => coin.denom === baseAsset.denom)?.amount ?? 0,
    ).dividedBy(10 ** baseAsset.decimals)

    if (walletAmount.isEqualTo(newAmount)) return
    setWalletAmount(newAmount)
  }, [walletBalances, baseAsset.denom, baseAsset.decimals, walletAmount])

  const baseCurrencyBalance = Number(
    findByDenom(walletBalances || [], baseCurrency.denom || '')?.amount || 0,
  )

  return (
    <div className={styles.wrapper}>
      {isTestnet && <span className={styles.network}>{networkConfig.name}</span>}
      <Button
        className={styles.button}
        onClick={() => {
          setShowDetails(!showDetails)
        }}
        color='tertiary'
        text={
          <>
            <span className={styles.address}>
              {userIcns ? userIcns.split('.')[0] : truncate(userWalletAddress, [2, 4])}
            </span>
            <span className={`${styles.balance} number`}>
              {!isLoading ? (
                `${formatValue(
                  walletAmount.toNumber(),
                  2,
                  2,
                  true,
                  false,
                  ` ${networkConfig.assets.base.symbol}`,
                )}`
              ) : (
                <CircularProgress className={styles.circularProgress} size={12} />
              )}
            </span>
          </>
        }
      />
      {showDetails && (
        <>
          <div className={styles.details}>
            <div className={styles.detailsHeader}>
              <div className={styles.detailsBalance}>
                <div className={styles.detailsDenom}>{baseCurrency.symbol}</div>
                <div className={`${styles.detailsBalanceAmount}`}>
                  <AnimatedNumber amount={walletAmount.toNumber()} />
                  <DisplayCurrency
                    className='s faded'
                    coin={{
                      amount: baseCurrencyBalance.toString(),
                      denom: baseCurrency.denom,
                    }}
                  />
                </div>
              </div>
              <div className={styles.detailsButton}>
                <Button
                  color='secondary'
                  onClick={onDisconnectWallet}
                  text={t('common.disconnect')}
                />
              </div>
            </div>
            <div className={styles.detailsBody}>
              <p className={styles.addressLabel}>{userIcns ? userIcns : t('common.yourAddress')}</p>
              <p className={styles.address}>{userWalletAddress}</p>
              <p className={styles.addressMobile}>{truncate(userWalletAddress, [14, 14])}</p>
              <div className={styles.buttons}>
                <button className={styles.copy} onClick={setCopied}>
                  <SVG.Copy color={colors.secondaryDark} />
                  {isCopied ? (
                    <>
                      {t('common.copied')} <SVG.Check color={colors.secondaryDark} />
                    </>
                  ) : (
                    <>{t('common.copy')}</>
                  )}
                </button>
                <button className={styles.external} onClick={viewOnFinder}>
                  <SVG.ExternalLink /> {t('common.viewOnExplorer', { explorer: explorerName })}
                </button>
              </div>
            </div>
          </div>
          <div className={styles.clickAway} onClick={onClickAway} role='button' />
        </>
      )}
    </div>
  )
}
