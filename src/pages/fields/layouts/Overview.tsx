import styles from './Overview.module.scss'
import BalanceCard from '../components/BalanceCard'
import PositionBar from '../../../components/PositionBar'
import { useEffect, useState } from 'react'
import { lookup, lookupDecimals } from '../../../libs/parse'
import { useTranslation } from 'react-i18next'
import { UST_DENOM } from '../../../constants/appConstants'
import useStore from '../../../store'
import Tooltip from '../../../components/tooltip/Tooltip'
import Card from '../../../components/card/Card'

interface Props {
    data: StrategyObject[]
}

const Overview = ({ data }: Props) => {
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

            data?.forEach((strategy: StrategyObject) => {
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
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [data]
    )

    return (
        <Card>
            <div className={styles.overview}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h6>{t('common.overview')}</h6>
                    </div>
                    <div className={styles.summary}>
                        <PositionBar
                            value={positionValue}
                            total={totalValue}
                            title={t('fields.positionValue')}
                            bars={positionValueArray}
                        />
                        <PositionBar
                            value={totalBorrowed}
                            total={totalValue}
                            title={t('fields.totalBorrowed')}
                            bars={totalBorrowedArray}
                        />
                        <PositionBar
                            value={netWorth}
                            total={totalValue}
                            title={t('fields.netWorth')}
                            bars={netWorthArray}
                        />
                    </div>
                </div>
                <div className={styles.stats}>
                    <BalanceCard
                        title={t('fields.netYield')}
                        value={netYield}
                        suffix={'%'}
                        prefix={''}
                        valueTextClass={'h4'}
                    />
                    <BalanceCard
                        title={t('mystation.estimatedDailyIncome')}
                        value={dailyIncome}
                        prefix={'$'}
                        valueTextClass={'h4'}
                    />
                    <BalanceCard
                        title={t('fields.unrealizedPnl')}
                        value={unrealizedPNL}
                        prefix={'$'}
                        valueTextClass={'h4'}
                    />
                </div>
                <div className={styles.tooltip}>
                    <Tooltip
                        content={t('fields.fieldsTooltip')}
                        iconWidth={'18px'}
                    />
                </div>
            </div>
        </Card>
    )
}

export default Overview
