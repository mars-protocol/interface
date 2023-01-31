import Tippy from '@tippyjs/react'
import classNames from 'classnames'
import { AnimatedNumber, DisplayCurrency } from 'components/common'
import { formatValue } from 'libs/parse'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './BorrowCapacity.module.scss'

interface Props {
  balance: number
  limit: number
  max: number
  barHeight: string
  showTitle?: boolean
  showPercentageText: boolean
  className?: string
  hideValues?: boolean
  roundPercentage?: boolean
  fadeTitle?: boolean
}

export const BorrowCapacity = ({
  balance,
  limit,
  max,
  barHeight = '22px',
  showTitle = true,
  showPercentageText = true,
  className,
  hideValues,
  roundPercentage = false,
  fadeTitle,
}: Props) => {
  const { t } = useTranslation()
  const baseCurrency = useStore((s) => s.baseCurrency)
  const convertToDisplayCurrency = useStore((s) => s.convertToDisplayCurrency)

  const [percentOfMaxRound, setPercentOfMaxRound] = useState(0)
  const [percentOfMaxRange, setPercentOfMaxRange] = useState(0)
  const [limitPercentOfMax, setLimitPercentOfMax] = useState(0)

  useMemo(() => {
    if (max === 0) {
      setPercentOfMaxRound(0)
      setPercentOfMaxRange(0)
      setLimitPercentOfMax(0)
      return
    }

    const pOfMax = +((balance / max) * 100).toFixed(2)
    setPercentOfMaxRound(+(Math.round(pOfMax * 100) / 100).toFixed(1))
    setPercentOfMaxRange(Math.min(Math.max(pOfMax, 0), 100))
    setLimitPercentOfMax((limit / max) * 100)
  }, [limit, balance, max])

  return (
    <div className={`${styles.container} ${className}`}>
      <div style={{ width: '100%' }}>
        <div
          className={styles.header}
          style={{
            width: `${limitPercentOfMax ? limitPercentOfMax + 6 : '100'}%`,
            marginBottom: !showTitle && hideValues ? 0 : 12,
          }}
        >
          <div className={classNames('overline', fadeTitle && 'faded')}>
            {showTitle && t('common.borrowingCapacity')}
          </div>
          {!hideValues && (
            <DisplayCurrency
              className={classNames(
                styles.limitText,
                'overline xxxsCaps',
                limitPercentOfMax && styles.show,
              )}
              coin={{
                amount: limit.toString(),
                denom: baseCurrency.denom,
              }}
            />
          )}
        </div>
        <Tippy
          appendTo={() => document.body}
          interactive={true}
          animation={false}
          render={(attrs) => {
            return (
              <div className='tippyContainer' {...attrs}>
                {t('redbank.borrowingBarTooltip', {
                  limit: formatValue(
                    convertToDisplayCurrency({
                      amount: limit.toString(),
                      denom: baseCurrency.denom,
                    }),
                    2,
                    2,
                    true,
                    '$',
                  ),
                  liquidation: formatValue(
                    convertToDisplayCurrency({
                      amount: max.toString(),
                      denom: baseCurrency.denom,
                    }),
                    2,
                    2,
                    true,
                    '$',
                  ),
                })}
              </div>
            )
          }}
        >
          <div className={styles.progressbarContainer} style={{ height: barHeight }}>
            <div className={styles.progressbar}>
              <div className={styles.limitLine} style={{ left: `${limitPercentOfMax || 0}%` }} />
              <div
                className={styles.limitBar}
                style={{
                  right: `${limitPercentOfMax ? 100 - limitPercentOfMax : 100}%`,
                }}
              ></div>

              <div className={styles.ltvContainer}>
                <div
                  className={styles.indicator}
                  style={{ width: `${percentOfMaxRange || 0.01}%` }}
                >
                  <div className={styles.gradient} />
                </div>
                {showPercentageText ? (
                  <span className={classNames('overline', styles.percentage)}>
                    {max !== 0 && (
                      <AnimatedNumber
                        amount={percentOfMaxRound}
                        suffix='%'
                        maxDecimals={roundPercentage ? 0 : undefined}
                        minDecimals={roundPercentage ? 0 : undefined}
                        abbreviated={false}
                      />
                    )}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </Tippy>
        {!hideValues && (
          <div className={`overline ${styles.values} xxxsCaps`}>
            <DisplayCurrency
              coin={{
                amount: balance.toString(),
                denom: baseCurrency.denom,
              }}
            />
            <span>{` ${t('common.of')} `}</span>
            <DisplayCurrency
              coin={{
                amount: max.toString(),
                denom: baseCurrency.denom,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
