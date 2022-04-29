import { formatValue, lookup } from '../../libs/parse'
import styles from './BorrowLimit.module.scss'
import { addDecimals } from '../../libs/math'
import { UST_DECIMALS, UST_DENOM } from '../../constants/appConstants'

interface Props {
    width: string
    ltv: number
    maxLtv: number
    liquidationThreshold: number
    barHeight: string
    showPercentageText: boolean
    showTitleText: boolean
    showLegend?: boolean
    top?: number
    percentageThreshold?: number
    percentageOffset?: number
    title?: string
    mode?: string
    criticalIndicator?: number
}

const BorrowLimit = ({
    width,
    ltv,
    maxLtv,
    liquidationThreshold,
    barHeight = '22px',
    showPercentageText = true,
    showLegend = true,
    top = 4,
    showTitleText = true,
    percentageThreshold = 15,
    percentageOffset = 45,
    title = 'Borrowing Capacity',
    mode = 'default',
    criticalIndicator,
}: Props) => {
    const ltvPercent =
        +(((ltv || 0) / (liquidationThreshold || 0)) * 100).toFixed(2) || 0

    const ltvPercentRounded = +(Math.round(ltvPercent * 100) / 100).toFixed(1)
    const ltvPercentRestrained =
        ltvPercent > 100 ? 100 : ltvPercent < 0 ? 0 : ltvPercent
    const ltvPercentMargin =
        ltvPercent > percentageThreshold
            ? `-${percentageOffset + 15}px`
            : '10px'
    const maxBorrowPercent =
        criticalIndicator || (maxLtv / liquidationThreshold) * 100

    return (
        <div className={styles.container}>
            <div style={{ width: width }}>
                {showTitleText ? (
                    <div className={`overline ${styles.title}`}>{title}</div>
                ) : null}

                <div
                    style={{ height: barHeight }}
                    className={styles.progressbarContainer}
                >
                    <div
                        style={{ width: width }}
                        className={styles.progressbar}
                    >
                        <div
                            style={{ left: `${maxBorrowPercent}%` }}
                            className={styles.limitLine}
                        />
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
                                            width: `${percentageOffset + 8}px`,
                                            textAlign:
                                                ltvPercent > percentageThreshold
                                                    ? 'right'
                                                    : 'left',
                                        }}
                                        className='overline'
                                    >
                                        {ltv < 0 ? (
                                            '0%'
                                        ) : (
                                            <>
                                                {`${
                                                    mode === 'default'
                                                        ? ltvPercentRounded
                                                        : addDecimals(ltv)
                                                }%`}
                                            </>
                                        )}
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
                        <div className={styles.zero}>
                            {mode === 'default' ? '$0' : '0%'}
                        </div>
                        <div className={styles.limit}>
                            {mode === 'default' ? (
                                <span>
                                    {formatValue(
                                        lookup(maxLtv, UST_DENOM, UST_DECIMALS),
                                        2,
                                        2,
                                        true,
                                        '$'
                                    )}
                                </span>
                            ) : (
                                formatValue(
                                    liquidationThreshold,
                                    0,
                                    0,
                                    true,
                                    false,
                                    '%'
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BorrowLimit
