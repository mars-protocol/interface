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
  const borrowKey =
    props.position.borrowDenom === props.vault.denoms.primary
      ? 'borrowedPrimary'
      : 'borrowedSecondary'
  const supplyKey = borrowKey === 'borrowedPrimary' ? 'primary' : 'secondary'
  const debtAmount = props.prevPosition.amounts[borrowKey]
  const userBalances = useStore((s) => s.userBalances)

  const borrowSymbol =
    props.position.borrowDenom === props.vault.denoms.primary
      ? props.vault.symbols.primary
      : props.vault.symbols.secondary

  const walletBalance = Number(
    (findByDenom(userBalances, props.vault.denoms[supplyKey]) as Coin)?.amount || 0,
  )

  const maxRepayAmount = Math.min(walletBalance, debtAmount)
  const amount = props.prevPosition.amounts[borrowKey] - props.position.amounts[borrowKey]
  const maxValue = Math.max(
    getLeverageFromValues(props.prevPosition.values),
    ltvToLeverage(props.vault.ltv.contract),
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
    const borrowedPrimaryValue = convertToBaseCurrency({
      denom: props.vault.denoms.primary,
      amount: position.amounts.borrowedPrimary.toString(),
    })
    const borrowedSecondaryValue = convertToBaseCurrency({
      denom: props.vault.denoms.secondary,
      amount: position.amounts.borrowedSecondary.toString(),
    })

    position.values.primary = primaryValue
    position.values.secondary = secondaryValue
    position.values.borrowedPrimary = borrowedPrimaryValue
    position.values.borrowedSecondary = borrowedSecondaryValue
    position.values.total =
      borrowedPrimaryValue + borrowedSecondaryValue + primaryValue + secondaryValue
    position.values.net = primaryValue + secondaryValue
    position.currentLeverage = getLeverageFromValues(position.values)

    return position
  }

  const handleChange = (amount: number) => {
    props.position.amounts[borrowKey] = props.prevPosition.amounts[borrowKey] - amount
    props.position.amounts[supplyKey] = props.prevPosition.amounts[supplyKey] + amount
    props.setPosition({ ...updateValues(props.position) })
  }

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <p className={styles.headline}>{t('fields.repayDebt')}</p>
        <TokenInput
          amount={amount}
          tokens={[borrowSymbol]}
          input={{
            denom: props.position.borrowDenom || props.vault.denoms.secondary,
            symbol: borrowSymbol,
            visible: true,
          }}
          maxAmount={maxRepayAmount}
          maxAmountLabel={t('global.max')}
          onChange={handleChange}
          disableGasWarning
        />
      </div>
      <RepayLeverage
        value={props.position.currentLeverage}
        maxValue={maxValue}
        leverageMax={ltvToLeverage(props.vault.ltv.contract)}
      />
      <div>
        <strong className='m'>{t('fields.repayingDebtFromWallet')}</strong>
        <p className='s faded'>{t('fields.repayDescription')}</p>
      </div>
    </div>
  )
}
