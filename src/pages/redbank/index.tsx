/* eslint-disable jsx-a11y/anchor-is-valid */
import { Backdrop, Card, Highlight, Notification, Title, Tutorial } from 'components/common'
import { AssetTable, Portfolio, useBorrowColumns, useDepositColumns } from 'components/redbank'
import { RED_BANK_TUTORIAL_KEY } from 'constants/appConstants'
import {
  balanceSum,
  ltvWeightedDepositValue,
  maintainanceMarginWeightedDepositValue,
} from 'libs/assetInfo'
import { useEffect, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import useStore from 'store'
import { NotificationType } from 'types/enums'
import { DocURL } from 'types/enums/docURL'

import styles from './Redbank.module.scss'

const RedBank = () => {
  // ------------------
  // EXTERNAL HOOKS
  // ------------------
  const { t } = useTranslation()
  const redBankAssets = useStore((s) => s.redBankAssets)
  const defaultDepositColumns = useDepositColumns()
  const defaultBorrowColumns = useBorrowColumns()

  // ------------------
  // STORE STATE
  // ------------------
  const marketInfo = useStore((s) => s.marketInfo)
  const userCollateral = useStore((s) => s.userCollateral)
  const tutorialStep = useStore((s) => s.tutorialSteps['redbank'])

  const maxBorrowLimit = useMemo(() => {
    if (!userCollateral || !redBankAssets) return 0
    return ltvWeightedDepositValue(
      redBankAssets,
      marketInfo,
      userCollateral,
      'depositBalanceBaseCurrency',
    )
  }, [redBankAssets, marketInfo, userCollateral])

  const liquidationThreshold = useMemo(() => {
    if (!userCollateral) return 0
    return maintainanceMarginWeightedDepositValue(
      redBankAssets,
      marketInfo,
      userCollateral,
      'depositBalanceBaseCurrency',
    )
  }, [redBankAssets, marketInfo, userCollateral])

  const maxLtvExceeded = (
    <Trans i18nKey='redbank.youAreGettingCloserToGettingLiquidated'>
      text
      <a
        className={styles.notificationLink}
        href={DocURL.RED_BANK_LIQUIDATIONS}
        rel='noreferrer'
        target='_blank'
      >
        Learn more.
      </a>
    </Trans>
  )

  const borrowBalance = Number(balanceSum(redBankAssets, 'borrowBalanceBaseCurrency'))

  const showLiquidationWarning = borrowBalance >= maxBorrowLimit && borrowBalance > 0

  const showTutorial = !localStorage.getItem(RED_BANK_TUTORIAL_KEY)

  const depositCard = (
    <Card
      hideHeaderBorder
      title={t('redbank.myDeposits')}
      tooltip={t('redbank.redBankMarketsDepositedTooltip')}
    >
      <AssetTable columns={defaultDepositColumns} data={redBankAssets} type='deposit' />
    </Card>
  )

  const borrowCard = (
    <Card
      hideHeaderBorder
      title={t('redbank.myBorrowings')}
      tooltip={t('redbank.redbankMarketsBorrowedTooltip')}
    >
      <AssetTable columns={defaultBorrowColumns} data={redBankAssets} type='borrow' />
    </Card>
  )

  useEffect(() => {
    if (Number(balanceSum(redBankAssets, 'depositBalanceBaseCurrency')) > 0) {
      localStorage.setItem(RED_BANK_TUTORIAL_KEY, 'true')
    }
  }, [redBankAssets])

  return (
    <div className={styles.markets}>
      <Backdrop show={showTutorial} />
      <Notification
        content={maxLtvExceeded}
        showNotification={showLiquidationWarning}
        type={NotificationType.Warning}
      />
      <Highlight show={tutorialStep === 3 || !showTutorial}>
        <div className={styles.summaryContainer}>
          <Card title={t('common.portfolio')} tooltip={t('redbank.redbankPortfolioTooltip')}>
            <div className={styles.summary}>
              <Portfolio borrowLimit={maxBorrowLimit} liquidationThreshold={liquidationThreshold} />
            </div>
          </Card>
        </div>
      </Highlight>

      <Title text={t('common.theMarkets')} />

      <div className={styles.grids}>
        <Highlight show={tutorialStep === 1 || !showTutorial}>
          {showTutorial ? (
            <Tutorial step={1} type='redbank'>
              {depositCard}
            </Tutorial>
          ) : (
            <>{depositCard}</>
          )}
        </Highlight>
        <Highlight show={tutorialStep === 2 || !showTutorial}>
          {showTutorial ? (
            <Tutorial step={2} type='redbank'>
              {borrowCard}
            </Tutorial>
          ) : (
            <>{borrowCard}</>
          )}
        </Highlight>
      </div>
    </div>
  )
}

export default RedBank
