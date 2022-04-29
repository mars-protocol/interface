import styles from './PositionStatusBar.module.scss'
import { addDecimals } from '../../../libs/math'
import { formatValue } from '../../../libs/parse'
import { useTranslation } from 'react-i18next'

interface Props {
    width: string
    ltv: number
    borrowLimit: number
    barHeight: string
    showPercentageText: boolean
    showLegend?: boolean
    top?: number
    liquidationThreshold?: number
    percentageThreshold?: number
    percentageOffset?: number
    title?: string
    mode?: string
}

const PositionStatusBar = ({
    width,
    ltv,
    borrowLimit,
    barHeight = '22px',
    showPercentageText = true,
    liquidationThreshold = 0.67,
    showLegend = true,
    top = 5,
    percentageThreshold = 15,
    percentageOffset = 45,
    title = 'Borrowing Capacity',
    mode = 'default',
}: Props) => {
    const ltvPercent = (ltv / liquidationThreshold) * 100
    const ltvPercentRounded = +(Math.round(ltvPercent * 100) / 100).toFixed(1)
    const ltvPercentRestrained =
        ltvPercent > 100 ? 100 : ltvPercent < 0 ? 0 : ltvPercent
    const ltvPercentMargin =
        ltvPercent > percentageThreshold ? `-${percentageOffset + 5}px` : '10px'
    const maxBorrowPercent = (borrowLimit / liquidationThreshold) * 100
    const { t } = useTranslation()

    return (
        <div className={styles.container}>
            <div style={{ width: width }}>
                <div
                    style={{ height: barHeight }}
                    className={styles.progressbarContainer}
                >
                    <div
                        style={{ width: width }}
                        className={styles.progressbar}
                    >
                        <div
                            style={{
                                width: `${maxBorrowPercent}%`,
                                maxWidth: width,
                            }}
                            className={styles.limit}
                        />
                        <div
                            style={{ left: `${maxBorrowPercent}%` }}
                            className={styles.dot}
                        />
                        <div
                            style={{ left: `${maxBorrowPercent}%` }}
                            className={styles.dotGlow}
                        />

                        <div className={styles.ltvContainer}>
                            <div
                                style={{
                                    width: `${ltvPercentRestrained}%`,
                                    maxWidth: width,
                                }}
                                className={styles.mask}
                            >
                                {showPercentageText ? (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: `${ltvPercentRestrained}%`,
                                            top: `${top}px`,
                                            marginLeft: ltvPercentMargin,
                                            width: `${percentageOffset}px`,
                                            textAlign:
                                                ltvPercent > percentageThreshold
                                                    ? 'right'
                                                    : 'left',
                                        }}
                                        className='overline'
                                    >
                                        {`${
                                            mode === 'default'
                                                ? ltvPercentRounded
                                                : addDecimals(ltv)
                                        }%`}
                                    </span>
                                ) : null}
                                <div
                                    style={{ width: width }}
                                    className={styles.indicator}
                                />
                                <div
                                    style={{
                                        width: `${ltvPercentRestrained}%`,
                                        maxWidth: width,
                                    }}
                                    className={styles.glow}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {showLegend && (
                    <div className={`overline ${styles.values}`}>
                        <div className={`inter ${styles.title}`}>
                            {t(`strategy.${title}`)}
                        </div>
                        <div className={styles.percent}>
                            {formatValue(
                                ltv,
                                mode === 'default' ? 2 : 0,
                                mode === 'default' ? 2 : 0,
                                true,
                                false,
                                '%'
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PositionStatusBar
