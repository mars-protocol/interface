import React, { useEffect, useState } from 'react'
import styles from './Breakdown.module.scss'
import Tooltip from '../../../../../components/tooltip/Tooltip'
import { assetData } from './input-section/InputSection'
import { formatValue, lookup } from '../../../../../libs/parse'
import BarGraph from '../../../../../components/bargraph/BarGraph'
import InfoTable from './InfoTable'
import { useTranslation } from 'react-i18next'
import { ViewType } from '../../../../../types/enums'
import { UST_DECIMALS, UST_DENOM } from '../../../../../constants/appConstants'
import { useRedBank } from '../../../../../hooks'

interface Props {
    title?: string
    backgroundColor: string
    ttCopy: string
    primaryAsset: assetData
    primaryInitialAmount: number
    primaryPrice: number
    secondaryAsset: assetData
    secondaryPrice: number
    secondaryInitialSupplyAmount: number
    secondaryInitialBorrowAmount: number
    activeView: string
    amounts: StrategyAmounts
    apy: number
    lastUpdate: number
    maxLtv: number
    position?: StrategyPosition
}

const Breakdown = ({
    title,
    backgroundColor,
    ttCopy,
    primaryAsset,
    primaryInitialAmount,
    primaryPrice,
    secondaryAsset,
    secondaryPrice,
    secondaryInitialSupplyAmount,
    secondaryInitialBorrowAmount,
    activeView,
    amounts,
    lastUpdate,
    maxLtv,
    apy = 0,
    position,
}: Props) => {
    const { t } = useTranslation()
    const { findMarketInfo } = useRedBank()
    const [debtAmount, setDebtAmount] = useState(amounts.debt)
    const borrowRate = Number(findMarketInfo(secondaryAsset.denom)?.borrow_rate)

    const nominalSupplyValue = amounts.primary * primaryPrice
    const yAxisLimit =
        nominalSupplyValue > debtAmount ? nominalSupplyValue : debtAmount
    const nominalDebtValue = amounts.debt * secondaryPrice

    const initialSupplyValue = primaryInitialAmount * primaryPrice
    const initialYAxisLimit =
        initialSupplyValue > secondaryInitialBorrowAmount
            ? initialSupplyValue
            : secondaryInitialBorrowAmount
    const initialDebtValue = secondaryInitialBorrowAmount * secondaryPrice
    // --------------------
    // Status
    // --------------------
    const isFarm = activeView === ViewType.Farm
    const isClosing = amounts.debt === 0 && amounts.primary === 0 && !isFarm

    useEffect(
        () => {
            setDebtAmount(amounts.debt)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [nominalDebtValue, initialDebtValue, amounts.debt, secondaryPrice]
    )

    // Calculate Liquidation Threshold
    const liquidationThreshold = lookup(
        nominalDebtValue / maxLtv / 2,
        UST_DENOM,
        UST_DECIMALS
    )

    const initialLiquidationThreshold = lookup(
        initialDebtValue / maxLtv / 2,
        UST_DENOM,
        UST_DECIMALS
    )

    const chartData = {
        bars: [
            lookup(nominalSupplyValue, UST_DENOM, UST_DECIMALS),
            lookup(nominalSupplyValue, UST_DENOM, UST_DECIMALS),
            lookup(debtAmount, UST_DENOM, UST_DECIMALS),
        ],
        labels: [
            primaryAsset.symbol,
            secondaryAsset.symbol,
            secondaryAsset.symbol,
        ],
        classNames: ['bgPrimary', 'bgSecondary', 'bgTertiary'],
        range: [0, lookup(yAxisLimit, UST_DENOM, UST_DECIMALS)],
        legend: [t('fields.myPosition'), t('common.borrowed')],
        liquidation: liquidationThreshold,
    }

    const chartDataBefore = {
        bars: [
            lookup(initialSupplyValue, UST_DENOM, UST_DECIMALS),
            lookup(initialSupplyValue, UST_DENOM, UST_DECIMALS),
            lookup(secondaryInitialBorrowAmount, UST_DENOM, UST_DECIMALS),
        ],
        labels: [
            primaryAsset.symbol,
            secondaryAsset.symbol,
            secondaryAsset.symbol,
        ],
        classNames: ['bgPrimary', 'bgSecondary', 'bgTertiary'],
        range: [0, lookup(initialYAxisLimit, UST_DENOM, UST_DECIMALS)],
        legend: [t('fields.myPosition'), t('common.borrowed')],
        liquidation: initialLiquidationThreshold,
    }

    const pnl = position?.pnl || 0
    const pnlPercentage = (pnl / (initialSupplyValue * 2)) * 100

    return (
        <div
            className={styles.container}
            style={{ background: backgroundColor }}
        >
            {title && isFarm && (
                <>
                    <div className={styles.tooltip}>
                        <Tooltip content={ttCopy} iconWidth={'18px'} />
                    </div>
                    <p className={styles.title}>{title}</p>
                </>
            )}
            <div className={styles.info}>
                <div
                    className={styles.infoContainer}
                    style={{
                        backgroundColor: !isFarm
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'transparent',
                    }}
                >
                    {!isFarm && (
                        <>
                            <p className={styles.title}>
                                {t('fields.currentPosition')}
                            </p>
                            <div className={styles.tooltip}>
                                <Tooltip
                                    content={t(
                                        'fields.fieldsBreakdownCurrentPositionTooltip'
                                    )}
                                    iconWidth={'18px'}
                                />
                            </div>
                        </>
                    )}
                    <BarGraph data={!isFarm ? chartDataBefore : chartData} />
                    {!isFarm && (
                        <InfoTable
                            apy={Number(position?.apy || 0)}
                            primaryAmount={primaryInitialAmount}
                            primaryAsset={primaryAsset}
                            primaryPrice={primaryPrice}
                            secondaryInitialSupplyAmount={
                                secondaryInitialSupplyAmount
                            }
                            secondarySupplyAmount={secondaryInitialSupplyAmount}
                            primaryInitialAmount={primaryInitialAmount}
                            secondaryAsset={secondaryAsset}
                            secondaryPrice={secondaryPrice}
                            secondaryBorrowAmount={secondaryInitialBorrowAmount}
                            liqThreshold={maxLtv}
                            activeView={activeView}
                            borrowRate={borrowRate}
                            secondaryInitialBorrowAmount={
                                secondaryInitialBorrowAmount
                            }
                            secondaryInPool={
                                position?.secondaryAssetAvailable || 0
                            }
                        />
                    )}
                </div>
                <div className={styles.infoContainer}>
                    {!isFarm && (
                        <>
                            <p className={styles.title}>{t('fields.after')}</p>
                            <div className={styles.tooltip}>
                                <Tooltip
                                    content={t(
                                        'fields.fieldsBreakdownUpdatedPositionTooltip'
                                    )}
                                    iconWidth={'18px'}
                                />
                            </div>
                            {isClosing && (
                                <div className={styles.close}>
                                    <p className={styles.closingHint}>
                                        {t('fields.yourPositionWillBeClosed')}
                                    </p>
                                    <div className={styles.closeWrapper}>
                                        <p className={styles.profit}>
                                            {t('fields.profitLoss')}
                                        </p>
                                        <p className={styles.pnl}>
                                            <span>$</span>
                                            <span>
                                                {formatValue(
                                                    lookup(
                                                        pnl,
                                                        UST_DENOM,
                                                        UST_DECIMALS
                                                    )
                                                )}
                                            </span>
                                        </p>
                                        <p
                                            className={
                                                pnl > 0
                                                    ? `${styles.pnlPercentage} ${styles.positive}`
                                                    : pnl === 0
                                                    ? styles.pnlPercentage
                                                    : `${styles.pnlPercentage} ${styles.negative}`
                                            }
                                        >
                                            {formatValue(
                                                pnlPercentage,
                                                2,
                                                2,
                                                true,
                                                false,
                                                '%'
                                            )}
                                        </p>
                                        <p className={styles.lastChange}>
                                            {`SINCE ${new Date(
                                                lastUpdate * 1000
                                            ).toLocaleDateString('en-US')}`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {!isFarm && !isClosing && <BarGraph data={chartData} />}
                    <InfoTable
                        apy={Number(position?.apy)}
                        primaryAmount={amounts.primary}
                        primaryAsset={primaryAsset}
                        primaryPrice={primaryPrice}
                        secondarySupplyAmount={amounts.secondary}
                        secondaryAsset={secondaryAsset}
                        secondaryPrice={secondaryPrice}
                        liqThreshold={maxLtv}
                        secondaryBorrowAmount={amounts.debt}
                        primaryInitialAmount={primaryInitialAmount}
                        secondaryInitialSupplyAmount={
                            secondaryInitialSupplyAmount
                        }
                        secondaryInitialBorrowAmount={
                            secondaryInitialBorrowAmount
                        }
                        activeView={activeView}
                        closePosition={isClosing}
                        borrowRate={borrowRate}
                        secondaryInPool={position?.secondaryAssetAvailable || 0}
                    />
                </div>
            </div>
        </div>
    )
}

export default Breakdown
