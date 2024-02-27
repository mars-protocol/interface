import { Coin } from '@cosmjs/proto-signing'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Button, DisplayCurrency, NumberInput } from 'components/common'
import { findByDenom } from 'functions'
import { useAsset } from 'hooks/data'
import { formatValue } from 'libs/parse'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './TokenInput.module.scss'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })

interface Props {
  tokens: string[]
  input: Input
  amount: number
  maxAmount?: number
  maxAmountLabel: string
  borrowRate?: number
  disableGasWarning?: boolean
  onChange: (amount: number) => void
  onSelect?: (denom: string) => void
}

export const TokenInput = (props: Props) => {
  const userBalances = useStore((s) => s.userBalances)
  const { t } = useTranslation()
  const baseCurrency = useStore((s) => s.baseCurrency)

  const walletBalance = findByDenom(userBalances, props.input.denom) as Coin
  const asset = useAsset({ denom: props.input.denom })
  const isSingleToken = props.tokens.length === 1
  const inputClasses = classNames([
    styles.input,
    'number',
    's',
    styles.secondary,
    isSingleToken && styles.singleToken,
  ])
  const selectClasses = classNames([styles.select, 's', isSingleToken && styles.disabled])
  const containerClasses = classNames([
    styles.container,
    styles.secondary,
    props.borrowRate !== undefined && styles.isBorrow,
  ])

  const onValueEntered = (microValue: number) => {
    if (props.maxAmount !== undefined) {
      if (microValue >= (props.maxAmount ?? 0)) microValue = props.maxAmount
    } else {
      if (!walletBalance?.amount) microValue = 0
      if (microValue >= (Number(walletBalance?.amount) ?? 0))
        microValue = Number(walletBalance?.amount)
    }
    props.onChange(microValue)
  }

  if (!asset) return null

  const maxAmount = props.maxAmount === undefined ? Number(walletBalance.amount) : props.maxAmount

  const showGasWarning =
    props.maxAmount &&
    props.amount >= props.maxAmount &&
    asset.denom === baseCurrency.denom &&
    !props.disableGasWarning

  return (
    <div className={styles.wrapper}>
      <Button
        color='quaternary'
        className={`xxsCaps faded ${styles.maxBtn}`}
        onClick={() => onValueEntered(maxAmount)}
        text={`${props.maxAmountLabel}: ${new BigNumber(maxAmount).shiftedBy(-1 * asset.decimals)}`}
        variant='transparent'
      />
      <div className={styles.input}>
        <div className={containerClasses}>
          <NumberInput
            onChange={onValueEntered}
            minValue={0}
            maxValue={props.maxAmount || 0}
            value={props.amount}
            maxDecimals={asset.decimals}
            allowNegative={false}
            suffix={isSingleToken ? ` ${props.input.symbol}` : ''}
            className={inputClasses}
            decimals={asset.decimals}
          />
          {!isSingleToken && (
            <>
              <div className={styles.divider} />
              <select
                onChange={(e) => props.onSelect && props.onSelect(e.target.value)}
                className={selectClasses}
                tabIndex={isSingleToken ? -1 : 0}
                value={props.input.symbol}
              >
                {props.tokens.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </>
          )}
          {showGasWarning ? (
            <div className={styles.inputWarning}>
              <p className='tippyContainer'>{t('common.lowUstAmountAfterTransaction')}</p>
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.bottomInfo}>
        <DisplayCurrency
          prefixClass='xxsCaps faded'
          valueClass='xxsCaps faded'
          coin={{ denom: asset.denom, amount: props.amount.toString() }}
        />
        {props.borrowRate && (
          <div>
            <span className='xxsCaps number faded'>
              {formatValue(props.borrowRate, 2, 2, true, false, `% ${t('common.apr')}`)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
