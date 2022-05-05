import styles from './Apy.module.scss'
import { formatValue } from '../../libs/parse'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRedBank } from '../../hooks'

interface Props {
    apyData: StrategyRate
    token: string
    leverage: string | number
    borrowDenom?: string
}

const Apy = ({ apyData, token, leverage, borrowDenom = 'uusd' }: Props) => {
    const { t } = useTranslation()
    const { findMarketInfo } = useRedBank()
    const [checkedApyData, setApyData] = useState<StrategyRate>(apyData)
    const borrowRate = Number(findMarketInfo(borrowDenom)?.borrow_rate) * 100
    const [totalApy, setTotalApy] = useState(0)

    useEffect(
        () => {
            if (apyData?.total !== checkedApyData?.total) {
                setApyData(apyData)
            }

            setTotalApy(checkedApyData.total - borrowRate)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [apyData, borrowRate]
    )

    return (
        <div className={styles.container}>
            <p className='sub2'>{t('fields.apyBreakdown')}</p>
            {checkedApyData?.trading > 0 && (
                <div className={styles.item}>
                    <span className={styles.label}>
                        {t('fields.tradingFeesApy')}
                    </span>
                    <span className={styles.value}>
                        {formatValue(
                            checkedApyData.trading,
                            2,
                            2,
                            true,
                            false,
                            '%',
                            true
                        )}
                    </span>
                </div>
            )}
            {checkedApyData?.astro > 0 && (
                <div className={styles.item}>
                    <span className={styles.label}>
                        {t('fields.protocolApy', { protocol: 'ASTRO' })}
                    </span>
                    <span className={styles.value}>
                        {formatValue(
                            checkedApyData.astro,
                            2,
                            2,
                            true,
                            false,
                            '%',
                            true
                        )}
                    </span>
                </div>
            )}
            {checkedApyData?.protocol > 0 && (
                <div className={styles.item}>
                    <span className={styles.label}>
                        {t('fields.protocolApy', { protocol: token })}
                    </span>
                    <span className={styles.value}>
                        {formatValue(
                            checkedApyData.protocol,
                            2,
                            2,
                            true,
                            false,
                            '%',
                            true
                        )}
                    </span>
                </div>
            )}
            <div className={`${styles.item} ${styles.border}`}>
                <span className={styles.label}>
                    {t('fields.borrowRateApy')}
                </span>
                <span className={styles.value}>
                    {formatValue(borrowRate, 2, 2, true, '-', '%', true)}
                </span>
            </div>
            {checkedApyData?.total > 0 && (
                <div
                    className={`${styles.item} ${styles.total} ${styles.border}`}
                >
                    <span className={styles.label}>
                        {t('fields.totalRewardsApy')}
                    </span>
                    <span className={styles.value}>
                        {formatValue(totalApy, 2, 2, true, false, '%', true)}
                    </span>
                </div>
            )}
            <div className={`${styles.item} ${styles.leverage}`}>
                <span className={styles.label}>
                    {t('fields.leveragedApy', {
                        leverage: formatValue(
                            Number(leverage),
                            2,
                            2,
                            true,
                            false,
                            'x',
                            true
                        ),
                    })}
                </span>
                <span className={styles.value}>
                    {formatValue(
                        totalApy * Number(leverage),
                        2,
                        2,
                        true,
                        false,
                        '%',
                        true
                    )}
                </span>
            </div>
        </div>
    )
}

export default Apy
