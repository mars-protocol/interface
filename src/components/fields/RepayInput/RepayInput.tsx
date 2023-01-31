import { RepayLeverage, TokenInput } from 'components/fields'
import { findByDenom } from 'functions'
import { getLeverageFromValues } from 'functions/fields'
import { ltvToLeverage } from 'libs/parse'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

import styles from './RepayInput.module.scss'

interface Props {
  vault: Vault
  prevPosition: Position
  position: Position
  setPosition: React.Dispatch<React.SetStateAction<Position>>
}

export const RepayInput = (props: Props) => {
  const { t } = useTranslation()
  const convertToBaseCurrency = useStore((s) => s.convertToBaseCurrency)
  const debtAmount = props.prevPosition.amounts.borrowed
  const userBalances = useStore((s) => s.userBalances)

  const walletBalance = Number(
    (findByDenom(userBalances, props.vault.denoms.secondary) as Coin)?.amount || 0,
  )

  const maxRepayAmount = Math.min(walletBalance, debtAmount)
  const amount = props.prevPosition.amounts.borrowed - props.position.amounts.borrowed
  const maxValue = Math.max(
    getLeverageFromValues(props.prevPosition.values),
    ltvToLeverage(props.vault.ltv.max),
  )

  const updateValues = (position: Position) => {
    const primaryValue = convertToBaseCurrency({
      denom: props.vault.denoms.primary,
      amount: position.amounts.primary.toString(),
    })
    const secondaryValue = convertToBaseCurrency({
      denom: props.vault.denoms.secondary,
      amount: position.amounts.secondary.toString(),
    })
    const borrowValue = convertToBaseCurrency({
      denom: props.vault.denoms.secondary,
      amount: position.amounts.borrowed.toString(),
    })
    position.values.secondary = secondaryValue
    position.values.borrowed = borrowValue
    position.values.total = borrowValue + primaryValue + secondaryValue
    position.values.net = primaryValue + secondaryValue
    position.currentLeverage = getLeverageFromValues(position.values)
    return position
  }

  const handleChange = (amount: number) => {
    props.position.amounts.borrowed = props.prevPosition.amounts.borrowed - amount
    props.position.amounts.secondary = props.prevPosition.amounts.secondary + amount
    props.setPosition({ ...updateValues(props.position) })
  }

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <p className={styles.headline}>{t('fields.repayDebt')}</p>
        <TokenInput
          amount={amount}
          tokens={[props.vault.symbols.secondary]}
          input={{
            denom: props.vault.denoms.secondary,
            symbol: props.vault.symbols.secondary,
            visible: true,
          }}
          maxAmount={maxRepayAmount}
          maxAmountLabel={t('global.max')}
          onChange={handleChange}
        />
      </div>
      <RepayLeverage
        value={props.position.currentLeverage}
        maxValue={maxValue}
        leverageMax={ltvToLeverage(props.vault.ltv.max)}
      />
      <div>
        <strong className='m'>{t('fields.repayingDebtFromWallet')}</strong>
        <p className='s faded'>{t('fields.repayDescription')}</p>
      </div>
    </div>
  )
}
