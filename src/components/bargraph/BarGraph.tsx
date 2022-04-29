import React from 'react'

import styles from './BarGraph.module.scss'
import { formatValue } from '../../libs/parse'

interface barGraphData {
    bars: number[]
    labels: string[]
    classNames: string[]
    range: number[]
    liquidation: number
    legend: string[]
}

interface Props {
    data: barGraphData
}

const BarGraph = ({ data }: Props) => {
    const liquidationPosition = data.liquidation / (data.range[1] / 100)

    const getBarHeightPercentage = (barIndex: number): number => {
        return Math.floor(
            (data.bars[barIndex] /
                Math.max(
                    data.bars[0] || 0,
                    data.bars[1] || 0,
                    data.bars[2] || 0
                )) *
                100
        )
    }

    return (
        <div className={styles.container}>
            <span className={`${styles.scale} ${styles.maxY}`}>
                {formatValue(data.range[1], 2, 2, true, '$')}
            </span>
            <span className={`${styles.scale} ${styles.minY}`}>
                {formatValue(data.range[0], 0, 0, true, '$')}
            </span>
            <span className={`${styles.legend} ${styles.position}`}>
                {data.legend[0]}
            </span>
            {data.bars[2] > 0 && (
                <span className={`${styles.legend} ${styles.debt}`}>
                    {data.legend[1]}
                </span>
            )}
            {data.bars[0] > 0 && (
                <div
                    className={`${styles.bar} ${styles.supply} ${data.classNames[0]}`}
                    style={
                        data.bars[0] === 0
                            ? { opacity: 0, height: '0%' }
                            : { height: `${getBarHeightPercentage(0)}%` }
                    }
                >
                    <span className={styles.label}>{data.labels[0]}</span>
                </div>
            )}
            {data.bars[1] > 0 && (
                <div
                    className={`${styles.bar} ${styles.borrow} ${data.classNames[1]}`}
                    style={
                        data.bars[1] === 0
                            ? { opacity: 0, height: '0%' }
                            : { height: `${getBarHeightPercentage(1)}%` }
                    }
                >
                    <span className={styles.label}>{data.labels[1]}</span>
                </div>
            )}
            {data.bars[2] > 0 && (
                <div
                    className={`${styles.bar} ${styles.debt} ${data.classNames[2]}`}
                    style={
                        data.bars[2] === 0
                            ? { height: '0%' }
                            : { height: `${getBarHeightPercentage(2)}%` }
                    }
                >
                    <span className={styles.label}>{data.labels[2]}</span>
                </div>
            )}
            {data.liquidation > 0 && (
                <>
                    <div
                        className={styles.liquidation}
                        style={{
                            bottom: `${
                                liquidationPosition < 13
                                    ? 13
                                    : liquidationPosition
                            }%`,
                        }}
                    >
                        <span>Liquidation threshold</span>
                    </div>
                    <div
                        className={styles.liquidationLine}
                        style={{
                            bottom: `${liquidationPosition}%`,
                        }}
                    />
                </>
            )}
        </div>
    )
}

export default BarGraph
