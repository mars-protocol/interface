import { Coin } from '@cosmjs/proto-signing'
import classNames from 'classnames'
import { AnimatedNumber, DisplayCurrency } from 'components/common'

import styles from './ValueWithLabel.module.scss'

interface Props {
  label: string
  percent?: number
  coin?: Coin
  className?: string
  orientation?: 'left' | 'right'
  labelClass?: string
  valueClass?: string
  prefixClass?: string
}

export const ValueWithLabel = ({
  label,
  percent,
  coin,
  className,
  orientation,
  valueClass = 'h4',
  prefixClass = 'sub2',
  labelClass,
}: Props) => {
  let valueNode: React.ReactNode

  if (coin) {
    valueNode = <DisplayCurrency coin={coin} prefixClass={prefixClass} valueClass={valueClass} />
  } else if (percent) {
    valueNode = (
      <div>
        <span className={valueClass}>
          {percent === 0 ? (
            <>0.00%</>
          ) : (
            <AnimatedNumber amount={percent} minDecimals={2} maxDecimals={2} suffix='%' />
          )}
        </span>
      </div>
    )
  } else {
    valueNode = (
      <div>
        <span className={valueClass}>0.00%</span>
      </div>
    )
  }

  return (
    <div className={classNames(className, orientation && styles[orientation])}>
      {valueNode}
      <div className={labelClass ? labelClass : styles.label}>{label}</div>
    </div>
  )
}
