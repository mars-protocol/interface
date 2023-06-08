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
  const performanceFee = apyData.fees && apyData.fees[0].value > 0 ? apyData.fees[0] : null

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
        <ul className={styles.list}>
          {apyData.apys
            ?.filter((apy) => apy.value > 0.009)
            .map((item, index) => (
              <li className={styles.listItem} key={index}>
                <span>- {item.type}</span>
                <span>{formatValue(item.value, 2, 2, true, false, '%', true)}</span>
              </li>
            ))}
        </ul>
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
            <div className={classNames(styles.item, !performanceFee && styles.border)}>
              <span className={styles.label}>{t('fields.borrowRateApy')}</span>
              <span className={styles.value}>
                {formatValue(borrowRate, 2, 2, true, '-', '%', true)}
              </span>
            </div>
          )}
          {performanceFee && (
            <div className={classNames(styles.item, styles.border)}>
              <span className={styles.label}>{performanceFee.type}</span>
              <span className={styles.value}>
                {formatValue(performanceFee.value, 2, 2, true, '-', '%', true)}
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
