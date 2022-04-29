import styles from './Apy.module.scss'
import { formatValue } from '../../libs/parse'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRedBank } from '../../hooks'

interface Props {
    trueApy: number
    apyData: StrategyRate
    aprData: StrategyRate
    token: string
    leverage?: string
    borrowDenom?: string
}

const Apy = ({
    trueApy,
    apyData,
    aprData,
    token,
    leverage,
    borrowDenom = 'uusd',
}: Props) => {
    const { t } = useTranslation()
    const { findMarketInfo } = useRedBank()
    const [checkedApyData, setApyData] = useState<StrategyRate>(apyData)
    const [checkedAprData, setAprData] = useState<StrategyRate>(aprData)

    useEffect(
        () => {
            if (apyData?.total !== checkedApyData?.total) {
                setApyData(apyData)
            }
            if (aprData?.total !== checkedAprData?.total) {
                setAprData(aprData)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [apyData, aprData]
    )

    return (
        <div className={styles.container}>
            <p className='sub2'>{t('fields.apyBreakdown')}</p>
            {checkedAprData?.trading > 0 && (
                <div className={styles.item}>
                    <span className={styles.label}>
                        {t('fields.tradingFeesApr')}
                    </span>
                    <span className={styles.value}>
                        {formatValue(
                            checkedAprData.trading,
                            2,
                            2,
                            true,
                            false,
                            '%'
                        )}
                    </span>
                </div>
            )}
            {checkedAprData?.astro > 0 && (
                <div className={styles.item}>
                    <span className={styles.label}>
                        {t('fields.protocolApr', { protocol: 'ASTRO' })}
                    </span>
                    <span className={styles.value}>
                        {formatValue(
                            checkedAprData.astro,
                            2,
                            2,
                            true,
                            false,
                            '%'
                        )}
                    </span>
                </div>
            )}
            {checkedAprData?.protocol > 0 && (
                <div className={styles.item}>
                    <span className={styles.label}>
                        {t('fields.protocolApr', { protocol: token })}
                    </span>
                    <span className={styles.value}>
                        {formatValue(
                            checkedAprData.protocol,
                            2,
                            2,
                            true,
                            false,
                            '%'
                        )}
                    </span>
                </div>
            )}
            {checkedApyData?.total > 0 && (
                <div className={styles.item}>
                    <span className={styles.label}>
                        {t('fields.totalRewardsApy')}
                    </span>
                    <span className={styles.value}>
                        {formatValue(
                            checkedApyData.total,
                            2,
                            2,
                            true,
                            false,
                            '%'
                        )}
                    </span>
                </div>
            )}
            {leverage && Number(leverage) > 0 && trueApy > 0 && (
                <>
                    <div className={styles.item}>
                        <span className={styles.label}>
                            {t('fields.borrowRateApr')}
                        </span>
                        <span className={styles.value}>
                            {formatValue(
                                Number(
                                    findMarketInfo(borrowDenom)?.borrow_rate
                                ) * 100,
                                2,
                                2,
                                true,
                                '-',
                                '%'
                            )}
                        </span>
                    </div>
                    <div className={`${styles.item} ${styles.leverage}`}>
                        <span className={styles.label}>
                            {`${t('fields.leverage')} ${formatValue(
                                leverage || 0,
                                2,
                                2,
                                true,
                                false,
                                'x',
                                true
                            )}`}
                        </span>
                    </div>
                    <div className={styles.item}>
                        <span className={styles.label}>
                            {t('fields.leveragedApy')}
                        </span>
                        <span className={styles.value}>
                            {formatValue(trueApy, 2, 2, true, false, '%')}
                        </span>
                    </div>
                </>
            )}
        </div>
    )
}

export default Apy
