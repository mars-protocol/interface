import { Coin } from '@cosmjs/stargate'
import { Card, ConnectButton, SVG, Title } from 'components/common'
import { AssetTable, useBorrowColumns, useDepositColumns } from 'components/redbank'
import { findByDenom } from 'functions'
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import useStore from 'store'
import { DocURL } from 'types/enums/docURL'

import styles from './RedbankNotConnected.module.scss'

export const RedbankNotConnected = () => {
  // ------------------
  // EXTERNAL HOOKS
  // ------------------
  const { t } = useTranslation()
  const defaultDepositColumns = useDepositColumns()
  const defaultBorrowColumns = useBorrowColumns()

  // ------------------
  // STORE STATE
  // ------------------
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)
  const marketAssetLiquidity = useStore((s) => s.marketAssetLiquidity)
  const marketInfo = useStore((s) => s.marketInfo)
  const convertToBaseCurrency = useStore((s) => s.convertToBaseCurrency)

  // ------------------
  // LOCAL STATE
  // ------------------
  const [dummyData, setDummyData] = useState<RedBankAsset[]>([])

  useEffect(() => {
    const dummyData: RedBankAsset[] = []
    if (!whitelistedAssets?.length) return
    whitelistedAssets.forEach((asset) => {
      const reserveInfo = findByDenom(marketInfo, asset.denom)
      const depositApy = reserveInfo?.liquidity_rate || 0
      const borrowApy = reserveInfo?.borrow_rate || 0
      const liquidity = findByDenom(marketAssetLiquidity, asset.denom) as Coin

      dummyData.push({
        ...asset,
        apy: depositApy * 100,
        borrowRate: borrowApy * 100,
        marketLiquidity: liquidity?.amount.toString() || '0',
        walletBalance: '0',
        borrowBalance: '0',
        depositBalance: '0',
        isCollateral: true,
        borrowBalanceBaseCurrency: 0,
        depositBalanceBaseCurrency: 0,
        depositCap: 100000000,
        depositLiquidity: 1000000,
      })
    })

    setDummyData(dummyData)
  }, [marketAssetLiquidity, marketInfo, convertToBaseCurrency, whitelistedAssets])

  return (
    <div className={styles.notConnected}>
      <div className={styles.welcome}>
        <SVG.RedBankIcon className={styles.icon} />
        <div className={styles.title}>{t('redbank.welcomeToTheRedBank')}</div>
        <div className={styles.subTitle}>{t('redbank.lendAndBorrowMoney')}</div>
        <div className={styles.desc}>
          <div>{t('common.youveArrivedOnMars')}</div>
          <div>
            <Trans i18nKey='redbank.readMoreAboutMarsOrLearnHowToUseTheRedBank'>
              <a href={DocURL.LANDING} rel='noreferrer' target='_blank'>
                Read more about Mars
              </a>
              &nbsp; or &nbsp;
              <a href={DocURL.RED_BANK} rel='noreferrer' target='_blank'>
                learn how to use the Red Bank.
              </a>
            </Trans>
          </div>
        </div>
        <ConnectButton color={'secondary'} />
      </div>

      <Title text={t('common.theMarkets')} />

      <div className={styles.grids}>
        <Card
          title={t('redbank.depositMarkets')}
          tooltip={t('redbank.redBankMarketsDepositedNotConnectedTooltip')}
        >
          <AssetTable columns={defaultDepositColumns} data={dummyData} disabled type='deposit' />
        </Card>

        <Card
          title={t('redbank.borrowMarkets')}
          tooltip={t('redbank.redbankMarketsBorrowedNotConnectedTooltip')}
        >
          <AssetTable columns={defaultBorrowColumns} data={dummyData} disabled type='borrow' />
        </Card>
      </div>
    </div>
  )
}
