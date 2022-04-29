import InputSection from './components/InputSection'
import styles from './ModalTab.module.scss'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccountBalance, useExchangeRate, useRedBank } from '../../../hooks'
import { lookup, lookupSymbol, formatValue, magnify } from '../../../libs/parse'
import Button from '../../../components/Button'
import { Coin } from '@terra-money/terra.js'
import {
    balanceSum,
    ltvWeightedDepositValue,
    maintainanceMarginWeightedDepositValue,
    producePercentData,
} from '../../../libs/assetInfo'
import { maxBorrowableAmount } from './logic/maxBorrowableAmount'
import { produceUpdatedAssetData } from './logic/produceUpdatedAssetData'
import { ModalActionButton } from '../RedbankAction'
import { plus } from '../../../libs/math'
import BorrowLimit from '../../../components/borrowlimit/BorrowLimit'
import { HorizontalBar, defaults } from 'react-chartjs-2'
import { produceBarChartConfig } from './logic/produceBarChartConfig'
import Collapse from '@material-ui/core/Collapse'
import ConnectButton from '../../../components/header/ConnectButton'
import { useTranslation } from 'react-i18next'
import { ViewType } from '../../../types/enums'
import { UST_DECIMALS, UST_DENOM } from '../../../constants/appConstants'
import useStore from '../../../store'

defaults.global.defaultFontFamily = 'Inter'

interface Props {
    amount: number
    borrowAssetData: AssetInfo[]
    supplyAssetData: AssetInfo[]
    setIsMax: (isMax: boolean) => void
    setAmountCallback: (amount: number) => void
    mmScaledDepositAmount: number
    ltvScaledDepositAmount: number
    totalBorrowUusdAmount: number
    actionButtonSpec: ModalActionButton
    submitted: boolean // todo move this onto action button spec?
    gasFeeFormatted: string
    taxFormatted: string
    activeView: ViewType
    denom: string
    decimals: number
}

const ModalTab = ({
    amount,
    borrowAssetData,
    supplyAssetData,
    setIsMax,
    setAmountCallback,
    mmScaledDepositAmount,
    ltvScaledDepositAmount,
    totalBorrowUusdAmount,
    actionButtonSpec,
    submitted,
    gasFeeFormatted,
    taxFormatted,
    activeView,
    denom,
    decimals,
}: Props) => {
    const { t } = useTranslation()
    // ---------------
    // queries
    // ---------------
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const { exchangeToUusd } = useExchangeRate()

    const { find, findDebt } = useAccountBalance()
    const { findLiquidity, findMarketInfo, findUserAssetCollateral } =
        useRedBank()
    const userWalletAddress = useStore((s) => s.userWalletAddress)

    // ---------------
    // States
    // ---------------
    const [currentAssetPrice, setCurrentAssetPrice] = useState(0)
    const [portfolioVisible, setPortfolioVisible] = useState(false)

    // read only states
    const walletBallance = Number(find(denom)?.amount.toString())
    const assetBorrowBalance = Number(findDebt(denom)?.amount.toString())
    const availableBalance = ltvScaledDepositAmount - totalBorrowUusdAmount

    // ----------------------
    // calculate
    // ----------------------
    const txFee = useMemo(
        () => Number(plus(gasFeeFormatted, taxFormatted)),
        [gasFeeFormatted, taxFormatted]
    )
    const relevantAssetData = useMemo(
        () =>
            activeView === ViewType.Deposit || activeView === ViewType.Withdraw
                ? supplyAssetData
                : borrowAssetData,
        [supplyAssetData, borrowAssetData, activeView]
    )

    const amountAdjustedAssetData = useMemo(
        () =>
            produceUpdatedAssetData(
                [...relevantAssetData],
                denom,
                decimals,
                amount * currentAssetPrice, // amount in uusd
                activeView
            ),
        [
            activeView,
            amount,
            relevantAssetData,
            currentAssetPrice,
            denom,
            decimals,
        ]
    )

    const maxDepositAmount = useMemo(() => {
        // leave $2 in their account for gas :)
        const buffer: number =
            denom === UST_DENOM ? Number(magnify(2, UST_DECIMALS)) : 0
        return walletBallance - buffer
    }, [walletBallance, denom])

    const percentData = producePercentData(
        produceUpdatedAssetData(
            [...relevantAssetData],
            denom,
            decimals,
            0.0,
            activeView
        )
    )
    const updatedData = producePercentData(amountAdjustedAssetData)

    // ------------------
    // logic
    // ------------------
    const newTotalMMScaledSupplyBalance = useMemo(
        () =>
            // For deposits and withdraws, we need to recalculate the loan limit
            {
                // On first deposit of asset, SC does not hold state of collateral.enabled
                // Therefore, we need to emulate this state
                const isFirstDeposit =
                    !relevantAssetData.find((asset) => asset.denom === denom) &&
                    activeView === ViewType.Deposit

                return activeView === ViewType.Deposit ||
                    activeView === ViewType.Withdraw
                    ? maintainanceMarginWeightedDepositValue(
                          amountAdjustedAssetData,
                          findMarketInfo,
                          findUserAssetCollateral,
                          isFirstDeposit ? denom : ''
                      )
                    : mmScaledDepositAmount
            },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeView, amountAdjustedAssetData, mmScaledDepositAmount]
    )

    const newTotalLTVScaledSupplyBalance = useMemo(
        () =>
            // For deposits and withdraws, we need to recalculate the loan limit
            {
                // On first deposit of asset, SC does not hold state of collateral.enabled
                // Therefore, we need to emulate this state
                const isFirstDeposit =
                    !relevantAssetData.find((asset) => asset.denom === denom) &&
                    activeView === ViewType.Deposit

                return activeView === ViewType.Deposit ||
                    activeView === ViewType.Withdraw
                    ? ltvWeightedDepositValue(
                          amountAdjustedAssetData,
                          findMarketInfo,
                          findUserAssetCollateral,
                          isFirstDeposit ? denom : ''
                      )
                    : ltvScaledDepositAmount
            },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeView, amountAdjustedAssetData, ltvScaledDepositAmount]
    )

    const debtValue =
        activeView === ViewType.Borrow || activeView === ViewType.Repay
            ? balanceSum(amountAdjustedAssetData)
            : totalBorrowUusdAmount

    const calculateMaxBorrowableAmount = useMemo((): number => {
        const assetLiquidity = Number(findLiquidity(denom)?.amount || 0)
        return maxBorrowableAmount(
            assetLiquidity,
            availableBalance,
            currentAssetPrice
        )
    }, [denom, availableBalance, currentAssetPrice, findLiquidity])

    const repayMax = useMemo((): number => {
        let adjustedWalletBalance = walletBallance
        if (denom === 'uusd') {
            adjustedWalletBalance =
                walletBallance - Number(magnify(txFee, UST_DECIMALS))
        }

        return Math.min(assetBorrowBalance, adjustedWalletBalance)
    }, [assetBorrowBalance, walletBallance, txFee, denom])

    const maxWithdrawableAmount = useMemo((): number => {
        const assetLtvRatio = findMarketInfo(denom)?.max_loan_to_value || 0
        const assetLiquidity = Number(findLiquidity(denom)?.amount || 0)
        const asset = supplyAssetData.find((asset) => asset.denom === denom)
        const assetBalanceOrAvailableLiquidity = Math.min(
            Number(asset?.balance),
            assetLiquidity
        )

        if (totalBorrowUusdAmount === 0) {
            return assetBalanceOrAvailableLiquidity
        }

        // If we did not receive a usable asset there is nothing more to do.
        if (!asset || !asset.balance || !asset.denom) return 0

        const withdrawableAmountOfAsset =
            availableBalance / (currentAssetPrice * assetLtvRatio)
        return withdrawableAmountOfAsset < assetBalanceOrAvailableLiquidity
            ? withdrawableAmountOfAsset
            : assetBalanceOrAvailableLiquidity
    }, [
        denom,
        currentAssetPrice,
        supplyAssetData,
        availableBalance,
        totalBorrowUusdAmount,
        findMarketInfo,
        findLiquidity,
    ])

    const maxUsableAmount = useMemo(
        () =>
            activeView === ViewType.Deposit
                ? maxDepositAmount
                : activeView === ViewType.Withdraw
                ? maxWithdrawableAmount
                : activeView === ViewType.Borrow
                ? calculateMaxBorrowableAmount
                : repayMax,
        [
            maxWithdrawableAmount,
            maxDepositAmount,
            calculateMaxBorrowableAmount,
            repayMax,
            activeView,
        ]
    )

    // -----------
    // callbacks
    // -----------
    const onValueEntered = (newValue: number) => {
        let microValue = Number(magnify(newValue, decimals)) || 0
        if (microValue >= maxUsableAmount) microValue = maxUsableAmount
        setAmountCallback(microValue)
    }

    const handleInputAmount = useCallback(
        (inputAmount: number) => {
            if (inputAmount > maxUsableAmount * 0.99) {
                setIsMax(true)
            }

            setAmountCallback(inputAmount)
        },
        [maxUsableAmount, setIsMax, setAmountCallback]
    )

    useEffect(() => {
        setCurrentAssetPrice(exchangeToUusd(new Coin(denom || '', 1 || '0')))
    }, [denom, exchangeToUusd])

    const produceTabActionButton = () => {
        return (
            <Button
                disabled={actionButtonSpec.disabled}
                showProgressIndicator={submitted}
                text={actionButtonSpec.text}
                onClick={() => actionButtonSpec.clickHandler()}
                color='primary'
            />
        )
    }

    const togglePortfolioVisibility = () => {
        portfolioVisible
            ? setPortfolioVisible(false)
            : setPortfolioVisible(true)
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
                        4,
                        true,
                        false,
                        false
                    ),
                    symbol: lookupSymbol(denom, whitelistedAssets || []),
                })

            case ViewType.Deposit:
                return t('common.inWalletAmountSymbol', {
                    amount: formatValue(
                        lookup(walletBallance, denom, decimals),
                        0,
                        4,
                        true,
                        false,
                        false
                    ),
                    symbol: lookupSymbol(denom, whitelistedAssets || []),
                })

            case ViewType.Withdraw:
                // Find amount of asset deposited
                const asset: AssetInfo | undefined = supplyAssetData.find(
                    (asset) => asset.denom === denom
                )
                return t('common.depositedAmountSymbol', {
                    amount: formatValue(
                        lookup(Number(asset?.balance), denom, decimals),
                        0,
                        4,
                        true,
                        false,
                        false
                    ),
                    symbol: lookupSymbol(denom, whitelistedAssets || []),
                })

            case ViewType.Repay:
                return t('mystation.borrowedAmountSymbol', {
                    amount: formatValue(
                        lookup(
                            Number(findDebt(denom)?.amount),
                            denom,
                            decimals
                        ),
                        0,
                        4,
                        true,
                        false,
                        false
                    ),
                    symbol: lookupSymbol(denom, whitelistedAssets || []),
                })
        }

        return ''
        // Will depend on the type -
    }

    // -------------
    // Presentation
    // -------------

    const produceBarChartData = (
        percentData: Array<number>,
        labels: string[]
    ) => {
        return {
            labels: labels,
            datasets: [
                {
                    axis: 'x',
                    barPercentage: 0.8,
                    maxBarThickness: 50,
                    data: percentData,
                    fill: false,
                    // colors
                    backgroundColor: [
                        '#DD5B65',
                        '#7150B7',
                        '#4176A9',
                        '#FEAF87',
                        '#87FEE1',
                    ],
                    borderWidth: 0,
                },
            ],
        }
    }

    const barChartHeight = 40 * percentData.length

    const actionButton = !userWalletAddress ? (
        <ConnectButton color={'secondary'} />
    ) : (
        produceTabActionButton()
    )

    const adjustedLabels = amountAdjustedAssetData.map((asset) =>
        lookupSymbol(asset.denom || '', whitelistedAssets || [])
    )
    const borrowLimitWidth = '280px'

    return (
        <div>
            <InputSection
                inputCallback={onValueEntered}
                availableText={produceAvailableText()}
                amount={amount}
                maxUsableAmount={maxUsableAmount}
                setAmountCallback={handleInputAmount}
                actionButton={actionButton}
                gasFeeFormatted={gasFeeFormatted}
                taxFormatted={taxFormatted}
                denom={denom}
                decimals={decimals}
                checkForMaxValue={activeView === ViewType.Deposit}
                onEnterHandler={onEnterAction}
            />

            {/* SITUATION COMPARISON */}
            <div className={styles.newSituation}>
                <div className={styles.borrowLimitContainer}>
                    <div className={styles.borrowLimit}>
                        <div className={styles.borrowLimitTitle}>
                            <span className={`overline ${styles.title}`}>
                                {activeView === ViewType.Withdraw ||
                                activeView === ViewType.Deposit
                                    ? t('common.currentDepositBalance')
                                    : t('common.currentBorrowBalance')}
                            </span>
                            <span className={styles.value}>
                                $
                                <span className={`h4`}>
                                    {formatValue(
                                        lookup(
                                            balanceSum(relevantAssetData),
                                            UST_DENOM,
                                            UST_DECIMALS
                                        )
                                    )}
                                </span>
                            </span>
                        </div>
                        <div style={{ width: borrowLimitWidth }}>
                            <BorrowLimit
                                width={borrowLimitWidth}
                                ltv={totalBorrowUusdAmount}
                                maxLtv={ltvScaledDepositAmount}
                                liquidationThreshold={mmScaledDepositAmount}
                                barHeight={'8px'}
                                showTitleText={false}
                                showPercentageText={false}
                            />
                        </div>
                    </div>
                    <div className={styles.borrowLimit}>
                        <div className={styles.borrowLimitTitle}>
                            <span className={`overline ${styles.title}`}>
                                {activeView === ViewType.Withdraw ||
                                activeView === ViewType.Deposit
                                    ? t('common.newDepositBalance')
                                    : t('common.newBorrowBalance')}
                            </span>
                            <span className={styles.value}>
                                $
                                <span className={'h4'}>
                                    {formatValue(
                                        lookup(
                                            balanceSum(amountAdjustedAssetData),
                                            UST_DENOM,
                                            UST_DECIMALS
                                        )
                                    )}
                                </span>
                            </span>
                        </div>
                        <div style={{ width: borrowLimitWidth }}>
                            <BorrowLimit
                                width={borrowLimitWidth}
                                ltv={debtValue}
                                maxLtv={newTotalLTVScaledSupplyBalance}
                                liquidationThreshold={
                                    newTotalMMScaledSupplyBalance
                                }
                                barHeight={'8px'}
                                showTitleText={false}
                                showPercentageText={false}
                            />
                        </div>
                    </div>
                </div>
                <Collapse in={portfolioVisible}>
                    <div className={styles.portfolio}>
                        <div className={styles.portfolioWrapper}>
                            <div
                                style={{
                                    width: borrowLimitWidth,
                                    marginTop: '12px',
                                }}
                            >
                                <HorizontalBar
                                    height={barChartHeight}
                                    data={produceBarChartData(
                                        percentData,
                                        adjustedLabels
                                    )}
                                    options={produceBarChartConfig(percentData)}
                                />
                            </div>
                        </div>
                        <div
                            style={{ width: borrowLimitWidth }}
                            className={styles.portfolioWrapper}
                        >
                            <div
                                style={{
                                    width: borrowLimitWidth,
                                    marginTop: '12px',
                                }}
                            >
                                <HorizontalBar
                                    height={barChartHeight}
                                    data={produceBarChartData(
                                        updatedData,
                                        adjustedLabels
                                    )}
                                    options={produceBarChartConfig(updatedData)}
                                />
                            </div>
                        </div>
                    </div>
                </Collapse>
            </div>

            <div className={styles.showPortfolio}>
                <Button
                    text={
                        !portfolioVisible
                            ? t('common.showPortfolio')
                            : t('common.closePortfolio')
                    }
                    onClick={togglePortfolioVisibility}
                    variant='transparent'
                    size='medium'
                />
            </div>
        </div>
    )
}

export default ModalTab
