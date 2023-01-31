import classNames from 'classnames'
import { formatValue } from 'libs/parse'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './Apy.module.scss'

interface VaultRate {
  total: number
  borrow: number
}

interface Props {
  apyData: VaultRate
  leverage: number
}

export const Apy = ({ apyData, leverage }: Props) => {
  const { t } = useTranslation()

  const totalApy = useMemo(() => apyData.total * leverage - apyData.borrow, [apyData, leverage])
  const leveragedApy = useMemo(() => apyData.total * leverage, [apyData, leverage])

  return (
    <div className={styles.container}>
      <p className='sub2'>{t('fields.apyBreakdown')}</p>
      {leverage > 1 && (
        <>
          <div className={classNames(styles.item, styles.total, styles.border)}>
            <span className={styles.label}>{t('fields.vaultApy')}</span>
            <span className={styles.value}>
              {formatValue(apyData.total, 2, 2, true, false, '%', true)}
            </span>
          </div>
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
          {apyData.borrow > 0 && (
            <div className={classNames(styles.item, styles.border)}>
              <span className={styles.label}>{t('fields.borrowRateApy')}</span>
              <span className={styles.value}>
                {formatValue(apyData.borrow, 2, 2, true, '-', '%', true)}
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
