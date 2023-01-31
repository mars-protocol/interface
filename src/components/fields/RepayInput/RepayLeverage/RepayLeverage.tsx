import { getLeverageRatio } from 'functions/fields'
import { formatValue } from 'libs/parse'
import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './RepayLeverage.module.scss'

interface Props {
  value: number
  minValue?: number
  maxValue: number
  leverageMax: number
}

export const RepayLeverage = ({ value, leverageMax, maxValue }: Props) => {
  const { t } = useTranslation()
  const leverageRatio = getLeverageRatio(leverageMax, maxValue)
  const marksArray = [
    0,
    // Remove mark #2 and #4 when less than 20% is available. 20% is reached when leverageRatio = 80: 80*0,25 = 20%
    ...(leverageRatio >= 80 ? [0.25 * leverageRatio] : []),
    0.5 * leverageRatio,
    ...(leverageRatio >= 80 ? [0.75 * leverageRatio] : []),
    leverageRatio,
    ...(100 - leverageRatio >= 2 ? [100] : []),
  ]

  return (
    <div className={styles.container}>
      <p className={styles.title}>
        <span className='sCaps'>
          {t('fields.leverage')}: {formatValue(value, 2, 2)}
        </span>
        <span className='xs'>x</span>
      </p>
      <div className={styles.barContainer}>
        <div className={styles.bar}>
          <div
            className={styles.fill}
            style={{ right: `calc(100% - ${((value - 1) / (maxValue - 1)) * 100}%)` }}
          ></div>
          <div className={styles.marks}>
            {marksArray.map((value, i) => (
              <div key={`mark-${i}`} className={styles.mark} style={{ left: `${value}%` }}>
                <div className={`${styles.label} xs faded`}>
                  {((value / 100) * (maxValue - 1) + 1).toFixed(1)}x
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
