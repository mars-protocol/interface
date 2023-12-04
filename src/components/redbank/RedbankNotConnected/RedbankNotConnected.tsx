import { Card, SVG, Title, WalletConnectButton } from 'components/common'
import { AssetTable, useBorrowColumns, useDepositColumns } from 'components/redbank'
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
  const whitelistedAssets = useStore((s) => s.networkConfig.assets.whitelist)
  const convertToBaseCurrency = useStore((s) => s.convertToBaseCurrency)
  // ------------------
  // LOCAL STATE
  // ------------------
  const [dummyData, setDummyData] = useState<RedBankAsset[]>([])

  useEffect(() => {
    const dummyData: RedBankAsset[] = []
    if (!whitelistedAssets?.length) return
    whitelistedAssets.forEach((asset) => {
      dummyData.push({
        ...asset,
        apy: 0,
        borrowRate: 0,
        marketLiquidity: '0',
        walletBalance: '0',
        borrowBalance: '0',
        depositBalance: '0',
        isCollateral: true,
        borrowBalanceBaseCurrency: 0,
        depositBalanceBaseCurrency: 0,
        depositCap: { amount: '0', used: '0' },
        depositLiquidity: 0,
        borrowEnabled: true,
        depositEnabled: true,
      })
    })

    setDummyData(dummyData)
  }, [convertToBaseCurrency, whitelistedAssets])

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
        <WalletConnectButton color={'secondary'} />
      </div>

      <Title text={t('common.theMarkets')} />

      <div className={styles.grids}>
        <Card
          title={t('redbank.depositMarkets')}
          tooltip={t('redbank.tooltips.deposit.market.unconnected')}
        >
          <AssetTable columns={defaultDepositColumns} data={dummyData} disabled type='deposit' />
        </Card>

        <Card
          title={t('redbank.borrowMarkets')}
          tooltip={t('redbank.tooltips.borrow.market.unconnected')}
        >
          <AssetTable columns={defaultBorrowColumns} data={dummyData} disabled type='borrow' />
        </Card>
      </div>
    </div>
  )
}
