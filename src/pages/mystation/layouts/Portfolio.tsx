import DonutGraph from '../../../components/donutgraph/DonutGraph'
import BalanceCard from '../components/BalanceCard'
import styles from './Portfolio.module.scss'
import { lookup, magnify } from '../../../libs/parse'
import { Coin } from '@terra-money/terra.js'
import { useExchangeRate, useRedBank } from '../../../hooks'
import RadialGauge from '../../../components/radialgauge/RadialGauge'

import { GradientValue } from '../../../components/radialgauge/elements/ValueArc'
import {
    ltvWeightedDepositValue,
    maintainanceMarginWeightedDepositValue,
} from '../../../libs/assetInfo'
import { useTranslation } from 'react-i18next'
import { UST_DECIMALS, UST_DENOM } from '../../../constants/appConstants'
import { useEffect, useState } from 'react'
import Button from '../../../components/Button'

interface Props {
    maxBorrow: number
    supplyMarketsData: AssetInfo[]
    borrowMarketsData: AssetInfo[]
    showDetailsClickHandler: () => void
    showDetails?: boolean
    isDummy?: boolean
}

const Portfolio = ({
    supplyMarketsData,
    borrowMarketsData,
    showDetailsClickHandler,
    showDetails,
    isDummy = false,
}: Props) => {
    const { exchangeToUusd } = useExchangeRate()
    const { findMarketInfo, findUserAssetCollateral } = useRedBank()
    const { t } = useTranslation()
    const [supplyApy, setSupplyApy] = useState(0)
    const [borrowApy, setBorrowApy] = useState(0)

    // -------------------
    // CONSTANTS
    // -------------------
    const CUTOUT_PERCENTAGE = 88
    const ASSET_CHART_STYLE_OVERRIDE = {
        width: '400px',
        marginTop: '2px',
        marginLeft: '-40px',
        marginRight: '-40px',
    }

    // ----------------
    // CALCULATE
    // ----------------
    const borrowBalance =
        lookup(
            borrowMarketsData.reduce(
                (total, currentAsset) =>
                    total +
                    exchangeToUusd(
                        new Coin(
                            currentAsset.denom || '',
                            currentAsset.balance || '0'
                        )
                    ),
                0
            ),
            UST_DENOM,
            UST_DECIMALS
        ) || 0

    const supplyBalance =
        lookup(
            supplyMarketsData.reduce(
                (total, currentAsset) =>
                    total +
                    exchangeToUusd(
                        new Coin(
                            currentAsset.denom || '',
                            currentAsset.balance || '0'
                        )
                    ),
                0
            ),
            UST_DENOM,
            UST_DECIMALS
        ) || 0

    const maxLtvAmount = isDummy
        ? 16050000000
        : ltvWeightedDepositValue(
              supplyMarketsData,
              findMarketInfo,
              findUserAssetCollateral
          )
    const liquidationThreshold = isDummy
        ? 17402513690
        : maintainanceMarginWeightedDepositValue(
              supplyMarketsData,
              findMarketInfo,
              findUserAssetCollateral
          )

    const ltv =
        (Number(magnify(borrowBalance, UST_DECIMALS)) / liquidationThreshold) *
        100
    const maxLtvPercent = (maxLtvAmount / liquidationThreshold) * 100

    const estimatedDailyInterestEarned = supplyMarketsData.reduce(
        (total, currentAsset) => total + Number(currentAsset.incomeOrExpense),
        0
    )

    const estimatedDailyInterestPaid = borrowMarketsData.reduce(
        (total, currentAsset) => total + Number(currentAsset.incomeOrExpense),
        0
    )

    // Note that apy is represented from 0 to 1 here, i.e 0.2212 for 22.12%
    useEffect(() => {
        let newSupplyApy = 0
        let newSupplyTotal = 0
        supplyMarketsData.forEach((supplyPosition) => {
            if (supplyPosition.apy && supplyPosition.uusdBalance) {
                if (supplyPosition.incentive?.apy) {
                    newSupplyApy +=
                        (supplyPosition.incentive?.apy + supplyPosition.apy) *
                        supplyPosition.uusdBalance
                } else {
                    newSupplyApy +=
                        supplyPosition.apy * supplyPosition.uusdBalance
                }

                newSupplyTotal += supplyPosition.uusdBalance
            }
        })
        setSupplyApy(newSupplyApy / newSupplyTotal)
    }, [supplyMarketsData])

    useEffect(() => {
        let newBorrowApy = 0
        let newBorrowTotal = 0
        borrowMarketsData.forEach((borrowPosition) => {
            if (borrowPosition.apy && borrowPosition.uusdBalance) {
                newBorrowApy += borrowPosition.apy * borrowPosition.uusdBalance
                newBorrowTotal += borrowPosition.uusdBalance
            }
        })

        setBorrowApy(newBorrowApy / newBorrowTotal)
    }, [borrowMarketsData])

    // ----------------
    // PRESENTATION
    // ----------------

    const generateTextView = (limit: number) => {
        const warningStyle = limit >= 80 ? { color: '#c83333' } : {}
        const container = {
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            marginTop: '84px',
        }
        return (
            // @ts-ignore
            <div style={container}>
                <span
                    className={`${styles.overline} overline`}
                    style={{ marginBottom: '8px' }}
                >
                    {t('common.borrowingCapacity')}
                </span>
                <div style={{ marginBottom: '-5px' }}>
                    <span className={`h2`} style={warningStyle}>
                        {limit > 0 ? limit.toFixed(0) : '0'}
                    </span>
                    <span style={warningStyle}>%</span>
                </div>
                <span className={'sub2'}>{t('global.reached')}</span>
            </div>
        )
    }

    const balanceCardStyle = {
        alignItems: 'center',
        textAlign: 'center',
        width: '160px',
    }

    const colorStops = Array<GradientValue>()
    colorStops.push({ value: 0, color: '#15BFA9' })
    colorStops.push({ value: 0.7, color: '#5E4BB1' })
    colorStops.push({ value: 0.9, color: 'rgba(228,0,0,.9)' })

    return (
        <div className={styles.portfolio}>
            <div className={styles.header}>
                <h6>{t('common.portfolio')}</h6>
            </div>
            <div className={styles.container}>
                <div className={styles.dials}>
                    <DonutGraph
                        title={t('mystation.deposited')}
                        placeholderTitle={'No Deposited Assets'}
                        value={supplyBalance}
                        cutoutPercentage={CUTOUT_PERCENTAGE}
                        labels={supplyMarketsData.map(
                            (asset: AssetInfo) => asset.symbol!!
                        )} // symbols
                        data={supplyMarketsData}
                        colors={supplyMarketsData.map(
                            (asset: AssetInfo) => asset.color!!
                        )}
                        styleOverride={ASSET_CHART_STYLE_OVERRIDE}
                    />
                    <RadialGauge
                        currentLtv={ltv}
                        maxLtv={maxLtvPercent}
                        maxValue={lookup(maxLtvAmount, UST_DENOM, UST_DECIMALS)}
                        generateText={generateTextView}
                        showMaxValue={true}
                        colorStops={colorStops}
                        showDot={true}
                    />
                    <DonutGraph
                        title={t('common.borrowed')}
                        placeholderTitle={t('mystation.noDepositedAssets')}
                        value={borrowBalance}
                        cutoutPercentage={CUTOUT_PERCENTAGE}
                        labels={borrowMarketsData.map(
                            (asset: AssetInfo) => asset.symbol!!
                        )}
                        data={borrowMarketsData}
                        colors={borrowMarketsData.map(
                            (asset: AssetInfo) => asset.color!!
                        )} // todo generate colors correctly
                        styleOverride={ASSET_CHART_STYLE_OVERRIDE}
                    />
                </div>

                <div className={styles.metricsContainer}>
                    {/** left side*/}
                    <div className={styles.metrics}>
                        <BalanceCard
                            title={t('mystation.estimatedDailyIncome')}
                            value={estimatedDailyInterestEarned}
                            prefix={'$'}
                            suffix={''}
                            style={balanceCardStyle}
                        />
                        <BalanceCard
                            title={t('mystation.yield')}
                            value={supplyApy || 0}
                            prefix={''}
                            suffix={'%'}
                            style={balanceCardStyle}
                        />
                    </div>

                    <div className={styles.metrics}>
                        {/* right side */}
                        <BalanceCard
                            title={t('mystation.estimatedDailyExpense')}
                            value={estimatedDailyInterestPaid}
                            prefix={'$'}
                            suffix={''}
                            style={balanceCardStyle}
                        />
                        <BalanceCard
                            title={t('mystation.borrowRate')}
                            value={borrowApy || 0}
                            prefix={''}
                            suffix={'%'}
                            style={balanceCardStyle}
                        />
                    </div>
                </div>
                {showDetails !== null && showDetails !== undefined ? (
                    <div className={styles.showDetailsButtonWrapper}>
                        <Button
                            text={
                                showDetails
                                    ? t('mystation.hideDetails')
                                    : t('fields.showDetails')
                            }
                            onClick={showDetailsClickHandler}
                            variant='transparent'
                            size='medium'
                        />
                    </div>
                ) : (
                    <div style={{ marginBottom: '120px', marginTop: '24px' }} />
                )}
            </div>
        </div>
    )
}

export default Portfolio
