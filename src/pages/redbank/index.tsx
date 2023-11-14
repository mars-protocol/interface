/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Backdrop,
  Card,
  CircularProgress,
  Highlight,
  Notification,
  Title,
  Tutorial,
} from 'components/common'
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
import { NotificationType, State } from 'types/enums'
import { DocURL } from 'types/enums/docURL'

import styles from './Redbank.module.scss'

const RedBank = () => {
  // ------------------
  // EXTERNAL HOOKS
  // ------------------
  const { t } = useTranslation()
  const redBankAssets = useStore((s) => s.redBankAssets)
  const redBankState = useStore((s) => s.redBankState)
  const setRedBankState = useStore((s) => s.setRedBankState)
  const defaultDepositColumns = useDepositColumns()
  const defaultBorrowColumns = useBorrowColumns()

  // ------------------
  // STORE STATE
  // ------------------
  const marketInfo = useStore((s) => s.marketInfo)
  const showTutorial = useStore((s) => s.showRedBankTutorial)
  const tutorialStep = useStore((s) => s.tutorialSteps['redbank'])
  const userBalancesState = useStore((s) => s.userBalancesState)
  const userCollateral = useStore((s) => s.userCollateral)

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

  useEffect(() => {
    if (redBankAssets.length === 0 || marketInfo.length === 0 || redBankState === State.READY)
      return
    setRedBankState(State.READY)
  }, [redBankAssets, marketInfo, redBankState, userBalancesState, setRedBankState])

  const borrowBalance = Number(balanceSum(redBankAssets, 'borrowBalanceBaseCurrency'))

  const showLiquidationWarning =
    borrowBalance >= maxBorrowLimit &&
    maxBorrowLimit !== 0 &&
    borrowBalance > 0 &&
    redBankState === State.READY

  const loader = (
    <div className={styles.loader}>
      <CircularProgress size={40} />
    </div>
  )

  const depositCard = (
    <Card
      hideHeaderBorder
      title={t('redbank.myDeposits')}
      tooltip={<Trans i18nKey='redbank.tooltips.deposit.market.connected' />}
    >
      {redBankState === State.READY ? (
        <AssetTable columns={defaultDepositColumns} data={redBankAssets} type='deposit' />
      ) : (
        loader
      )}
    </Card>
  )

  const borrowCard = (
    <Card
      hideHeaderBorder
      title={t('redbank.myBorrowings')}
      tooltip={<Trans i18nKey='redbank.tooltips.borrow.market.connected' />}
    >
      {redBankState === State.READY ? (
        <AssetTable columns={defaultBorrowColumns} data={redBankAssets} type='borrow' />
      ) : (
        loader
      )}
    </Card>
  )

  useEffect(() => {
    if (userBalancesState !== State.READY) return

    if (localStorage.getItem(RED_BANK_TUTORIAL_KEY)) {
      return useStore.setState({ showRedBankTutorial: false })
    }

    if (Number(balanceSum(redBankAssets, 'depositBalanceBaseCurrency')) > 0) {
      localStorage.setItem(RED_BANK_TUTORIAL_KEY, 'true')
      return useStore.setState({ showRedBankTutorial: false })
    }

    useStore.setState({ showRedBankTutorial: true })
  }, [redBankAssets, userBalancesState])

  return (
    <div className={styles.markets}>
      <Backdrop show={showTutorial && redBankState === State.READY} />
      <Notification
        content={maxLtvExceeded}
        showNotification={showLiquidationWarning}
        type={NotificationType.Warning}
      />
      <Highlight show={tutorialStep === 3 || !showTutorial}>
        <div className={styles.summaryContainer}>
          <Card title={t('common.portfolio')} tooltip={t('redbank.tooltips.portfolio')}>
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
