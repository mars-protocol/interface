import styles from './FieldsOfMarsOverview.module.scss'
import PositionBar from '../../../components/PositionBar'
import { useEffect, useState } from 'react'
import { lookup, lookupDecimals } from '../../../libs/parse'
import SeparatedBalanceCard from '../components/SeparatedBalanceCard'
import PositionStatusBar from '../components/PositionStatusBar'
import { CircularProgress } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { UST_DENOM } from '../../../constants/appConstants'
import Tooltip from '../../../components/tooltip/Tooltip'
import useStore from '../../../store'
import Button from '../../../components/Button'

interface Props {
    data: StrategyObject[]
    showDetailsClickHandler: () => void
    showDetails: boolean
    loaded: boolean
}

interface RiskPosition {
    title: string
    value: number
    ltv: number
}

const FieldsOfMarsOverview = ({
    data,
    showDetailsClickHandler,
    showDetails,
    loaded,
}: Props) => {
    const { t } = useTranslation()
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const [positionValueArray, setPositionValueArray] = useState<
        StrategyBarItem[]
    >([])
    const [positionValue, setPositionValue] = useState(0)
    const [totalValue, setTotalValue] = useState(0)
    const [totalBorrowedArray, setTotalBorrowedArray] = useState<
        StrategyBarItem[]
    >([])
    const [totalBorrowed, setTotalBorrowed] = useState(0)
    const [netWorthArray, setNetWorthArray] = useState<StrategyBarItem[]>([])
    const [netWorth, setNetWorth] = useState(0)
    const [netYield, setNetYield] = useState(0)
    const [dailyIncome, setDailyIncome] = useState(0)
    const [unrealizedPNL, setUnrealizedPNL] = useState(0)
    const [riskPositions, setRiskPositions] = useState<RiskPosition[]>([])

    useEffect(
        () => {
            let newPositionValue = 0
            let newTotalValue = 0
            let newTotalBorrowed = 0
            let newNetWorth = 0
            let newNetYield = 0
            let newDailyIncome = 0
            let newUnrealizedPNL = 0
            const newPositionValueArray: StrategyBarItem[] = []
            const newTotalBorrowedArray: StrategyBarItem[] = []
            const newNetWorthArray: StrategyBarItem[] = []
            const newRiskPositions: RiskPosition[] = []

            data?.forEach((strategy: StrategyObject) => {
                if (Number(strategy.position?.bond_units) > 0) {
                    newRiskPositions.push({
                        title: t(strategy.key),
                        value: Number(strategy.health?.ltv ?? 0) * 100,
                        ltv: Number(strategy?.max_ltv ?? 0.67) * 100,
                    })
                }

                if (strategy.position) {
                    const currentPositionValue = Number(
                        strategy.health?.bond_value || 0
                    )
                    const positionBorrowed = Number(
                        strategy.health?.debt_value || 0
                    )
                    const positionNetWorth = Number(
                        strategy.position.net_worth || 0
                    )
                    const positionPnL = Number(strategy.position.pnl || 0)
                    const apy = Number(strategy.position.trueApy || 0)
                    const denom = strategy.position?.denom ?? UST_DENOM
                    const decimals =
                        lookupDecimals(denom, whitelistedAssets || []) || 6
                    newPositionValueArray.push({
                        name: t(strategy.key),
                        color: strategy.color,
                        value: currentPositionValue,
                    })

                    newTotalBorrowedArray.push({
                        name: t(strategy.key),
                        color: strategy.color,
                        value: positionBorrowed,
                    })

                    newNetWorthArray.push({
                        name: t(strategy.key),
                        color: strategy.color,
                        value: positionNetWorth,
                    })

                    newDailyIncome += lookup(
                        Number(strategy.position.daily_return),
                        denom,
                        decimals
                    )

                    newTotalValue += currentPositionValue
                    newPositionValue += lookup(
                        currentPositionValue,
                        denom,
                        decimals
                    )
                    newTotalBorrowed += lookup(
                        positionBorrowed,
                        denom,
                        decimals
                    )
                    newNetWorth += lookup(positionNetWorth, denom, decimals)
                    newUnrealizedPNL += lookup(positionPnL, denom, decimals)

                    newNetYield +=
                        apy * lookup(positionNetWorth, denom, decimals)
                }
            })

            newNetYield = newNetYield / newNetWorth
            setPositionValueArray(newPositionValueArray)
            setPositionValue(newPositionValue)
            setTotalValue(newTotalValue)
            setTotalBorrowedArray(newTotalBorrowedArray)
            setTotalBorrowed(newTotalBorrowed)
            setNetWorthArray(newNetWorthArray)
            setNetWorth(newNetWorth)
            setNetYield(newNetYield)
            setDailyIncome(newDailyIncome)
            setUnrealizedPNL(newUnrealizedPNL)
            setRiskPositions(
                newRiskPositions.sort((a, b) => (a.value < b.value ? 1 : -1))
            )
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [data]
    )

    return (
        <div className={styles.overview}>
            <div className={styles.container}>
                <div className={styles.tooltip}>
                    <Tooltip
                        content={t('fields.fieldsOfMarsOverviewTooltip')}
                        iconWidth={'18px'}
                    />
                </div>
                <div className={styles.header}>
                    <h6>{t('fields.fieldsOfMarsOverview')}</h6>
                </div>
                <div className={styles.summary}>
                    <PositionBar
                        value={positionValue}
                        total={totalValue}
                        title={t('fields.positionValue')}
                        bars={positionValueArray}
                        compactView={true}
                    />
                    <PositionBar
                        value={totalBorrowed}
                        total={totalValue}
                        title={t('fields.totalBorrowed')}
                        bars={totalBorrowedArray}
                        compactView={true}
                    />
                    <PositionBar
                        value={netWorth}
                        total={totalValue}
                        title={t('fields.netWorth')}
                        bars={netWorthArray}
                        compactView={true}
                    />
                    <div className={styles.stats}>
                        <SeparatedBalanceCard
                            title={t('fields.unrealizedPnl')}
                            value={unrealizedPNL}
                            prefix={'$'}
                        />

                        <SeparatedBalanceCard
                            title={t('mystation.estimatedDailyIncome')}
                            value={dailyIncome}
                            prefix={'$'}
                        />

                        <SeparatedBalanceCard
                            title={t('fields.netYield')}
                            value={netYield}
                            suffix={'%'}
                            prefix={''}
                        />
                    </div>
                </div>
                <div className={styles.buttonWrapper}>
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
            </div>
            <div className={styles.positions}>
                <span className={`h6 ${styles.title}`}>
                    {t('mystation.loanToValue')}
                </span>
                <span className={`sub2 ${styles.subTitle}`}>
                    {t('mystation.mostRiskyPositions')}
                </span>
                <div className={styles.positionContainer}>
                    {loaded ? (
                        <>
                            {riskPositions.map((position, key) => (
                                <PositionStatusBar
                                    key={key}
                                    width={'297px'}
                                    ltv={position.value}
                                    liquidationThreshold={position.ltv}
                                    borrowLimit={50}
                                    barHeight={'8px'}
                                    showPercentageText={false}
                                    title={position.title}
                                    mode={'percent'}
                                />
                            ))}
                        </>
                    ) : (
                        <div className={styles.positionLoader}>
                            <CircularProgress size={40} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FieldsOfMarsOverview
