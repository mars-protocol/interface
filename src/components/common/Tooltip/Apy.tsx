import classNames from 'classnames'
import { formatValue } from 'libs/parse'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './Apy.module.scss'

interface Props {
  apyData: ApyBreakdown | PositionApyBreakdown
  borrowRate: number
  leverage: number
}

export const Apy = ({ apyData, leverage, borrowRate }: Props) => {
  const { t } = useTranslation()
  const totalApy = useMemo(
    () => (apyData.total ?? 0) * leverage - borrowRate ?? 0,
    [apyData, leverage, borrowRate],
  )
  const leveragedApy = useMemo(() => (apyData.total ?? 0) * leverage, [apyData, leverage])

  return (
    <div className={styles.container}>
      <p className='sub2'>{t('fields.apyBreakdown')}</p>
      <div className={classNames(styles.border)}>
        <div className={classNames(styles.item, styles.total)}>
          <span className={styles.label}>{t('fields.vaultApy')}</span>
          <span className={styles.value}>
            {formatValue(apyData.total ?? 0, 2, 2, true, false, '%', true)}
          </span>
        </div>
      </div>
      {leverage > 1 && (
        <>
          <div className={styles.item}>
            <span className={styles.label}>
              {t('fields.leveragedApy', {
                leverage: formatValue(Number(leverage), 2, 2, true, false, 'x', true),
              })}
            </span>
            <span className={styles.value}>
              {formatValue(leveragedApy, 2, 2, true, false, '%', true)}
            </span>
          </div>
          {borrowRate > 0 && (
            <div className={classNames(styles.item, styles.border)}>
              <span className={styles.label}>{t('fields.borrowRateApy')}</span>
              <span className={styles.value}>
                {formatValue(borrowRate, 2, 2, true, '-', '%', true)}
              </span>
            </div>
          )}
        </>
      )}
      <div className={classNames(styles.item, styles.total)}>
        <span className={styles.label}>
          {t('fields.totalApy', {
            leverage: formatValue(Number(leverage), 2, 2, true, false, 'x', true),
          })}
        </span>
        <span className={styles.value}>{formatValue(totalApy, 2, 2, true, false, '%', true)}</span>
      </div>
    </div>
  )
}
