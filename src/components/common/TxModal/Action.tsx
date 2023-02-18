import 'chart.js/auto'

import { Coin } from '@cosmjs/stargate'
import classNames from 'classnames'
import {
  BorrowCapacity,
  Button,
  Card,
  ConnectButton,
  DisplayCurrency,
  ErrorMessage,
  InputSection,
} from 'components/common'
import { findByDenom } from 'functions'
import { maxBorrowableAmount } from 'functions/redbank/maxBorrowableAmount'
import { produceBarChartConfig } from 'functions/redbank/produceBarChartConfig'
import { produceUpdatedAssetData } from 'functions/redbank/produceUpdatedAssetData'
import { useUserBalance } from 'hooks/queries'
import {
  balanceSum,
  ltvWeightedDepositValue,
  maintainanceMarginWeightedDepositValue,
  producePercentData,
} from 'libs/assetInfo'
import { formatValue, lookup, lookupSymbol, magnify } from 'libs/parse'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import colors from 'styles/_assets.module.scss'
import { ViewType } from 'types/enums'

import styles from './Action.module.scss'

interface Props {
  amount: number
  redBankAssets: RedBankAsset[]
  depositAssets: RedBankAsset[]
  borrowAssets: RedBankAsset[]
  setIsMax: (isMax: boolean) => void
  setCapHit: (capHit: boolean) => void
  setAmountCallback: (amount: number) => void
  mmScaledDepositAmount: number
  ltvScaledDepositAmount: number
  totalBorrowBaseCurrencyAmount: number
  actionButtonSpec: ModalActionButton
  submitted: boolean
  feeError?: string
  txFee?: Coin
  activeView: ViewType
  denom: string
  decimals: number
  handleClose: () => void
}

export const Action = ({
  amount,
  redBankAssets,
  depositAssets,
  borrowAssets,
  setIsMax,
  setCapHit,
  setAmountCallback,
  mmScaledDepositAmount,
  ltvScaledDepositAmount,
  totalBorrowBaseCurrencyAmount,
  actionButtonSpec,
  submitted,
  feeError,
  txFee,
  activeView,
  denom,
  decimals,
  handleClose,
}: Props) => {
  const { t } = useTranslation()
  // ------------------
  // STORE STATE
  // ------------------
  const baseCurrency = useStore((s) => s.baseCurrency)
  const marketInfo = useStore((s) => s.marketInfo)
  const marketAssetLiquidity = useStore((s) => s.marketAssetLiquidity)
  const userCollateral = useStore((s) => s.userCollateral)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)
  const convertToBaseCurrency = useStore((s) => s.convertToBaseCurrency)
  const findUserDebt = useStore((s) => s.findUserDebt)
  const enableAnimations = useStore((s) => s.enableAnimations)

  // ------------------
  // LOCAL STATE
  // ------------------
  const [currentAssetPrice, setCurrentAssetPrice] = useState(0)
  const [portfolioVisible, setPortfolioVisible] = useState(false)
  const [chartsDataLoaded, setChartsDataLoaded] = useState(false)

  const { data: userBalances } = useUserBalance()

  /// ------------------
  // VARIABLES
  // ------------------
  const walletBalance = Number(findByDenom(userBalances || [], denom)?.amount.toString()) || 0
  const assetBorrowBalance = findUserDebt(denom)
  const availableBalanceBaseCurrency = Math.max(
    ltvScaledDepositAmount - totalBorrowBaseCurrencyAmount,
    0,
  )
  const currentAsset = redBankAssets.find((asset) => asset.denom === denom)

  // -------------------------
  // calculate
  // -------------------------
  const relevantAssetData = useMemo(
    () =>
      activeView === ViewType.Deposit || activeView === ViewType.Withdraw
        ? depositAssets
        : borrowAssets,
    [depositAssets, borrowAssets, activeView],
  )

  const relevantBalanceKey = useMemo(
    () =>
      activeView === ViewType.Deposit || activeView === ViewType.Withdraw
        ? 'depositBalanceBaseCurrency'
        : 'borrowBalanceBaseCurrency',
    [activeView],
  )

  const amountAdjustedAssetData = useMemo(
    () =>
      produceUpdatedAssetData(
        redBankAssets,
        [...relevantAssetData],
        denom,
        amount * currentAssetPrice, // amount in display currency
        activeView,
        relevantBalanceKey,
      ),
    [
      activeView,
      amount,
      relevantAssetData,
      currentAssetPrice,
      denom,
      redBankAssets,
      relevantBalanceKey,
    ],
  )

  const percentData = producePercentData(
    produceUpdatedAssetData(
      redBankAssets,
      [...relevantAssetData],
      denom,
      0.0,
      activeView,
      relevantBalanceKey,
    ),
    relevantBalanceKey,
  )
  const updatedData = producePercentData(amountAdjustedAssetData, relevantBalanceKey)

  // ---------------------
  // logic
  // ---------------------
  const newTotalMMScaledSupplyBalance = useMemo(
    () =>
      // For deposits and withdraws, we need to recalculate the loan limit
      {
        if (!userCollateral) return 0
        // On first deposit of asset, SC does not hold state of collateral.enabled
        // Therefore, we need to emulate this state
        const isFirstDeposit =
          !relevantAssetData.find((asset) => asset.denom === denom) &&
          activeView === ViewType.Deposit

        return activeView === ViewType.Deposit || activeView === ViewType.Withdraw
          ? maintainanceMarginWeightedDepositValue(
              amountAdjustedAssetData,
              marketInfo,
              userCollateral,
              relevantBalanceKey,
              isFirstDeposit ? denom : '',
            )
          : mmScaledDepositAmount
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeView, amountAdjustedAssetData, mmScaledDepositAmount],
  )

  const newTotalLTVScaledSupplyBalance = useMemo(
    () =>
      // For deposits and withdraws, we need to recalculate the loan limit
      {
        if (!userCollateral) return 0
        // On first deposit of asset, SC does not hold state of collateral.enabled
        // Therefore, we need to emulate this state
        const isFirstDeposit =
          !relevantAssetData.find((asset) => asset.denom === denom) &&
          activeView === ViewType.Deposit

        return activeView === ViewType.Deposit || activeView === ViewType.Withdraw
          ? ltvWeightedDepositValue(
              amountAdjustedAssetData,
              marketInfo,
              userCollateral,
              relevantBalanceKey,
              isFirstDeposit ? denom : '',
            )
          : ltvScaledDepositAmount
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeView, amountAdjustedAssetData, ltvScaledDepositAmount],
  )

  const debtValue =
    activeView === ViewType.Borrow || activeView === ViewType.Repay
      ? balanceSum(amountAdjustedAssetData, relevantBalanceKey)
      : totalBorrowBaseCurrencyAmount

  const calculateMaxBorrowableAmount = useMemo((): number => {
    const assetLiquidity = Number(findByDenom(marketAssetLiquidity, denom)?.amount || 0)

    return maxBorrowableAmount(assetLiquidity, availableBalanceBaseCurrency, currentAssetPrice)
  }, [denom, availableBalanceBaseCurrency, currentAssetPrice, marketAssetLiquidity])

  const repayMax = useMemo((): number => {
    let adjustedWalletBalance = walletBalance
    if (denom === baseCurrency.denom) {
      adjustedWalletBalance = walletBalance - Number(magnify(Number(txFee), 6))
    }

    return Math.min(assetBorrowBalance, adjustedWalletBalance)
  }, [assetBorrowBalance, walletBalance, txFee, denom, baseCurrency.denom])

  const maxWithdrawableAmount = useMemo((): number => {
    const assetLtvRatio = findByDenom(marketInfo, denom)?.max_loan_to_value || 0
    const assetLiquidity = Number(findByDenom(marketAssetLiquidity, denom)?.amount || 0)
    const asset = depositAssets.find((asset) => asset.denom === denom)
    const assetBalanceOrAvailableLiquidity = Math.min(Number(asset?.depositBalance), assetLiquidity)

    if (totalBorrowBaseCurrencyAmount === 0) {
      return assetBalanceOrAvailableLiquidity
    }

    // If we did not receive a usable asset there is nothing more to do.
    if (!asset || !asset.depositBalance || !asset.denom) return 0

    const withdrawableAmountOfAsset =
      availableBalanceBaseCurrency / (currentAssetPrice * assetLtvRatio)

    return withdrawableAmountOfAsset < assetBalanceOrAvailableLiquidity
      ? withdrawableAmountOfAsset
      : assetBalanceOrAvailableLiquidity
  }, [
    denom,
    currentAssetPrice,
    depositAssets,
    availableBalanceBaseCurrency,
    totalBorrowBaseCurrencyAmount,
    marketInfo,
    marketAssetLiquidity,
  ])

  const maxUsableAmount = useMemo(() => {
    if (!currentAsset) return 0
    return activeView === ViewType.Deposit
      ? walletBalance
      : activeView === ViewType.Withdraw
      ? maxWithdrawableAmount
      : activeView === ViewType.Borrow
      ? calculateMaxBorrowableAmount
      : repayMax
  }, [
    walletBalance,
    maxWithdrawableAmount,
    calculateMaxBorrowableAmount,
    repayMax,
    activeView,
    currentAsset,
  ])

  useEffect(() => {
    setCurrentAssetPrice(convertToBaseCurrency({ denom: denom || '', amount: '1' }))
  }, [denom, convertToBaseCurrency])

  useEffect(() => {
    if (!chartsDataLoaded && percentData[0] != 0) {
      setChartsDataLoaded(true)
    }
  }, [percentData, chartsDataLoaded])

  const chartRefBefore = useRef(null)
  const chartRefAfter = useRef(null)

  // -----------
  // callbacks
  // -----------
  const handleInputAmount = useCallback(
    (inputAmount: number) => {
      if (inputAmount >= maxUsableAmount * 0.99) {
        setIsMax(true)
      }

      setAmountCallback(Number(formatValue(inputAmount, 0, 0, false, false, false, false, false)))
    },
    [maxUsableAmount, setIsMax, setAmountCallback],
  )

  if (!currentAsset) return <></>

  const amountUntilDepositCap = currentAsset.depositCap - Number(currentAsset.depositLiquidity)

  const onValueEntered = (newValue: number) => {
    let microValue = Number(magnify(newValue, decimals)) || 0

    if (microValue >= maxUsableAmount) microValue = maxUsableAmount
    setAmountCallback(Number(formatValue(microValue, 0, 0, false, false, false, false, false)))
    setCapHit(amount > amountUntilDepositCap && activeView === ViewType.Deposit)
  }

  const produceTabActionButton = () => {
    return (
      <>
        <Button
          color='primary'
          className={styles.submitButton}
          disabled={actionButtonSpec.disabled}
          onClick={() => actionButtonSpec.clickHandler()}
          showProgressIndicator={actionButtonSpec.fetching}
          text={actionButtonSpec.text}
        />
        <ErrorMessage message={feeError} alignment='center' />
      </>
    )
  }

  const onEnterAction = () => {
    if (!actionButtonSpec.disabled) actionButtonSpec.clickHandler()
  }

  const produceAvailableText = () => {
    switch (activeView) {
      case ViewType.Borrow:
        return t('common.maxLimitAmountSymbol', {
          amount: formatValue(
            lookup(maxUsableAmount, denom, decimals),
            0,
            decimals,
            true,
            '',
            '',
            false,
            false,
          ),
          symbol: lookupSymbol(denom, whitelistedAssets || []),
        })

      case ViewType.Deposit:
        return t('common.inWalletAmountSymbol', {
          amount: formatValue(
            lookup(walletBalance, denom, decimals),
            0,
            decimals,
            true,
            '',
            '',
            false,
            false,
          ),
          symbol: lookupSymbol(denom, whitelistedAssets || []),
        })

      case ViewType.Withdraw:
        // Find amount of asset deposited
        const asset: RedBankAsset | undefined = depositAssets.find((asset) => asset.denom === denom)
        return t('common.depositedAmountSymbol', {
          amount: formatValue(
            lookup(Number(asset?.depositBalance), denom, decimals),
            0,
            decimals,
            true,
            '',
            '',
            false,
            false,
          ),
          symbol: lookupSymbol(denom, whitelistedAssets || []),
        })

      case ViewType.Repay:
        return t('redbank.borrowedAmountSymbol', {
          amount: formatValue(
            lookup(findUserDebt(denom), denom, decimals),
            0,
            decimals,
            true,
            '',
            '',
            false,
            false,
          ),
          symbol: lookupSymbol(denom, whitelistedAssets || []),
        })
    }

    return ''
  }

  // -------------
  // Presentation
  // -------------

  const produceBarChartData = (percentData: Array<number>, labels: string[]) => {
    const barColors: string[] = []
    labels.forEach((label) => {
      barColors.push(colors[label.toLowerCase()])
    })
    return {
      labels: labels,
      datasets: [
        {
          axis: 'x',
          barPercentage: 0.8,
          maxBarThickness: 50,
          data: percentData,
          fill: true,
          backgroundColor: barColors,
          borderWidth: 1,
          animation: {
            duration: enableAnimations ? 800 : 0,
          },
        },
      ],
    }
  }

  const barChartHeight = 40 * percentData.length + 10

  const actionButton = !userWalletAddress ? (
    <ConnectButton color={'secondary'} />
  ) : (
    produceTabActionButton()
  )

  const adjustedLabels = amountAdjustedAssetData.map((asset) =>
    lookupSymbol(asset.denom || '', whitelistedAssets || []),
  )

  const getTooltip = (): string | undefined => {
    switch (activeView) {
      case ViewType.Borrow:
        return t('redbank.tooltips.borrow.action')
      case ViewType.Deposit:
        return t('redbank.tooltips.deposit.action')
      case ViewType.Withdraw:
        return t('redbank.tooltips.withdraw.action')
      case ViewType.Repay:
        return t('redbank.tooltips.repay.action')
    }
  }

  const collapsableStyles = classNames(styles.collapsable, !portfolioVisible && styles.collapsed)

  return (
    <Card onClick={handleClose} title={activeView} tooltip={getTooltip()}>
      <InputSection
        actionButton={actionButton}
        amount={amount}
        availableText={produceAvailableText()}
        checkForMaxValue={activeView === ViewType.Deposit || activeView === ViewType.Repay}
        asset={currentAsset}
        disabled={
          submitted ||
          (amountUntilDepositCap <= 0 && activeView === ViewType.Deposit) ||
          maxUsableAmount < 1
        }
        inputCallback={onValueEntered}
        maxUsableAmount={maxUsableAmount}
        onEnterHandler={onEnterAction}
        setAmountCallback={handleInputAmount}
        amountUntilDepositCap={amountUntilDepositCap}
        activeView={activeView}
        walletBalance={walletBalance}
      />

      {/* SITUATION COMPARISON */}
      <div className={styles.newSituation}>
        <div className={styles.borrowCapacityContainer}>
          <div className={styles.borrowCapacity}>
            <div className={styles.borrowCapacityTitle}>
              <span className={`overline ${styles.title}`}>
                {activeView === ViewType.Withdraw || activeView === ViewType.Deposit
                  ? t('common.currentDepositBalance')
                  : t('common.currentBorrowBalance')}
              </span>
              <DisplayCurrency
                className={styles.value}
                coin={{
                  denom: baseCurrency.denom,
                  amount: balanceSum(relevantAssetData, relevantBalanceKey).toString(),
                }}
                prefixClass='sub2'
                valueClass='h4'
              />
            </div>
            <BorrowCapacity
              balance={totalBorrowBaseCurrencyAmount}
              barHeight={'17px'}
              limit={ltvScaledDepositAmount}
              max={mmScaledDepositAmount}
              showPercentageText
              fadeTitle
            />
          </div>
          <div className={styles.borrowCapacity}>
            <div className={styles.borrowCapacityTitle}>
              <span className={`overline ${styles.title}`}>
                {activeView === ViewType.Withdraw || activeView === ViewType.Deposit
                  ? t('common.newDepositBalance')
                  : t('common.newBorrowBalance')}
              </span>
              <DisplayCurrency
                className={styles.value}
                coin={{
                  denom: baseCurrency.denom,
                  amount: balanceSum(amountAdjustedAssetData, relevantBalanceKey).toString(),
                }}
                prefixClass='sub2'
                valueClass='h4'
              />
            </div>
            <BorrowCapacity
              balance={debtValue}
              barHeight={'17px'}
              limit={newTotalLTVScaledSupplyBalance}
              max={newTotalMMScaledSupplyBalance}
              showPercentageText
              fadeTitle
            />
          </div>
        </div>
        {chartsDataLoaded && (
          <div className={collapsableStyles}>
            <div className={styles.portfolio}>
              <div className={styles.portfolioWrapper}>
                <span className={`overline ${styles.title}`}>
                  {t('redbank.currentComposition')}
                </span>
                <div className={styles.chartWrapper}>
                  <Bar
                    data={produceBarChartData(percentData, adjustedLabels)}
                    height={barChartHeight}
                    options={produceBarChartConfig(percentData)}
                    ref={chartRefBefore}
                  />
                </div>
              </div>
              <div className={styles.portfolioWrapper}>
                <span className={`overline ${styles.title}`}>{t('redbank.newComposition')}</span>
                <div className={styles.chartWrapper}>
                  <Bar
                    data={produceBarChartData(updatedData, adjustedLabels)}
                    height={barChartHeight}
                    options={produceBarChartConfig(updatedData)}
                    ref={chartRefAfter}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {chartsDataLoaded && (
        <div className={styles.showPortfolio}>
          <Button
            onClick={() => setPortfolioVisible(!portfolioVisible)}
            size='medium'
            text={!portfolioVisible ? t('common.showComposition') : t('common.closeComposition')}
            variant='transparent'
          />
        </div>
      )}
    </Card>
  )
}
