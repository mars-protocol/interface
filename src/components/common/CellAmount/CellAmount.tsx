import classNames from 'classnames'
import { AnimatedNumber, DisplayCurrency } from 'components/common'
import { lookup } from 'libs/parse'

import styles from './CellAmount.module.scss'

interface Props {
  denom: string
  decimals: number
  amount: number
  noBalanceText?: string
}

export const CellAmount = ({ denom, decimals, amount, noBalanceText }: Props) => {
  const assetAmount = lookup(amount, denom, decimals)
  const noBalanceClasses = classNames('s', 'faded', styles.noBalanceText)

  return (
    <div>
      <p className='m'>
        <AnimatedNumber
          amount={assetAmount > 0 && assetAmount < 0.01 ? 0.01 : assetAmount}
          prefix={assetAmount > 0 && assetAmount < 0.01 ? '< ' : false}
        />
      </p>
      {amount === 0 ? (
        <p className={noBalanceClasses}>{noBalanceText}</p>
      ) : (
        <DisplayCurrency
          coin={{
            amount: amount.toString(),
            denom,
          }}
          prefixClass='s faded'
          valueClass='s faded'
        />
      )}
    </div>
  )
}
