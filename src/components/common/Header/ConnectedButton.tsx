import { ChainInfoID, SimpleChainInfoList, useWalletManager } from '@marsprotocol/wallet-connector'
import { AnimatedNumber, Button, CircularProgress, DisplayCurrency, SVG } from 'components/common'
import { findByDenom } from 'functions'
import { useUserBalance } from 'hooks/queries'
import { formatValue, lookup } from 'libs/parse'
import { truncate } from 'libs/text'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useClipboard from 'react-use-clipboard'
import useStore from 'store'
import colors from 'styles/_assets.module.scss'

import styles from './ConnectedButton.module.scss'

export const ConnectedButton = () => {
  // ---------------
  // EXTERNAL HOOKS
  // ---------------
  const { disconnect } = useWalletManager()
  const { t } = useTranslation()

  // ---------------
  // STORE
  // ---------------
  const baseCurrency = useStore((s) => s.baseCurrency)
  const chainInfo = useStore((s) => s.chainInfo)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const userWalletName = useStore((s) => s.userWalletName)

  // ---------------
  // LOCAL STATE
  // ---------------
  const [isCopied, setCopied] = useClipboard(userWalletAddress, {
    successDuration: 1000 * 5,
  })
  const { data, isLoading } = useUserBalance()

  // ---------------
  // VARIABLES
  // ---------------
  const baseCurrencyBalance = Number(findByDenom(data || [], baseCurrency.denom || '')?.amount || 0)
  const explorerName =
    chainInfo && SimpleChainInfoList[chainInfo.chainId as ChainInfoID].explorerName

  const [showDetails, setShowDetails] = useState(false)

  const viewOnFinder = useCallback(() => {
    const explorerUrl = chainInfo && SimpleChainInfoList[chainInfo.chainId as ChainInfoID].explorer

    window.open(`${explorerUrl}account/${userWalletAddress}`, '_blank')
  }, [chainInfo, userWalletAddress])

  const onClickAway = useCallback(() => {
    setShowDetails(false)
  }, [])

  const currentBalanceAmount = lookup(
    baseCurrencyBalance,
    baseCurrency.denom,
    baseCurrency.decimals,
  )

  return (
    <div className={styles.wrapper}>
      {chainInfo?.chainId !== ChainInfoID.Osmosis1 && (
        <span className={styles.network}>{chainInfo?.chainId}</span>
      )}
      <Button
        className={styles.button}
        onClick={() => {
          setShowDetails(!showDetails)
        }}
        color='tertiary'
        prefix={<SVG.Osmo className={styles.svg} />}
        text={
          <>
            <span className={styles.address}>
              {userWalletName ? userWalletName : truncate(userWalletAddress, [2, 4])}
            </span>
            <span className={`${styles.balance} number`}>
              {!isLoading ? (
                `${formatValue(
                  currentBalanceAmount,
                  2,
                  2,
                  true,
                  false,
                  ` ${chainInfo?.stakeCurrency?.coinDenom}`,
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
                <div className={styles.detailsDenom}>{chainInfo?.stakeCurrency?.coinDenom}</div>
                <div className={`${styles.detailsBalanceAmount}`}>
                  <AnimatedNumber amount={currentBalanceAmount} abbreviated={false} />
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
                <Button color='secondary' onClick={disconnect} text={t('common.disconnect')} />
              </div>
            </div>
            <div className={styles.detailsBody}>
              <p className={styles.addressLabel}>
                {userWalletName ? `‘${userWalletName}’` : t('common.yourAddress')}
              </p>
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
