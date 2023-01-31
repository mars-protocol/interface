import { TokenBalance } from 'components/common'
import { SWAP_THRESHOLD } from 'constants/appConstants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './Content.module.scss'

interface Props {
  vault: Vault
  position: Position
  prevPosition?: Position
}
export const EditContent = (props: Props) => {
  const { t } = useTranslation()
  const convertValueToAmount = useStore((s) => s.convertValueToAmount)

  const primaryAmount = props.position.amounts.primary - (props.prevPosition?.amounts.primary || 0)
  const secondaryAmount =
    props.position.amounts.secondary - (props.prevPosition?.amounts.secondary || 0)
  const borrowedAmount =
    props.position.amounts.borrowed - (props.prevPosition?.amounts.borrowed || 0)

  const depositPrimary = (
    <TokenBalance
      coin={{
        denom: props.vault.denoms.primary,
        amount: primaryAmount.toString(),
      }}
      className={styles.marginRight}
      showSymbol
    />
  )

  const depositSecondary = (
    <TokenBalance
      coin={{
        denom: props.vault.denoms.secondary,
        amount: secondaryAmount.toString(),
      }}
      className={styles.marginRight}
      showSymbol
    />
  )

  const borrowSecondary = (
    <TokenBalance
      coin={{
        denom: props.vault.denoms.secondary,
        amount: borrowedAmount.toString(),
      }}
      className={styles.marginRight}
      showSymbol
    />
  )

  const getDepositMessage = () => {
    const hasPrimarySupply = primaryAmount > 0
    const hasSecondarySupply = secondaryAmount > 0

    if (!hasPrimarySupply && !hasSecondarySupply) return null

    return (
      <li>
        <span className={styles.marginRight}>{t('redbank.deposit')}</span>
        {hasPrimarySupply && depositPrimary}
        {hasPrimarySupply && hasSecondarySupply && (
          <span className={styles.marginRight}>{t('common.and')}</span>
        )}
        {hasSecondarySupply && depositSecondary}
      </li>
    )
  }

  const getBorrowMessage = () => {
    if (borrowedAmount === 0) return

    return (
      <li>
        <span className={styles.marginRight}>{t('redbank.borrow')}</span>
        {borrowSecondary}
      </li>
    )
  }

  const getSwapMessage = () => {
    const primaryValue = props.position.values.primary
    const secondaryValue = props.position.values.secondary + props.position.values.borrowed
    const difference = Math.abs(primaryValue - secondaryValue)
    if (difference < SWAP_THRESHOLD) return null

    let swapInputDenom = props.vault.denoms.primary
    let swapTargetDenom = props.vault.denoms.secondary

    if (primaryValue < secondaryValue) {
      swapInputDenom = props.vault.denoms.secondary
      swapTargetDenom = props.vault.denoms.primary
    }

    return (
      <li>
        <span className={styles.marginRight}>{t('common.swap')}</span>
        <TokenBalance
          coin={{
            denom: swapInputDenom,
            amount: convertValueToAmount({
              denom: swapInputDenom,
              amount: (difference / 2).toString(),
            }).toString(),
          }}
          className={styles.marginRight}
          showSymbol
        />
        <span className={styles.marginRight}>{t('common.for')}</span>
        <TokenBalance
          coin={{
            denom: swapTargetDenom,
            amount: convertValueToAmount({
              denom: swapTargetDenom,
              amount: (difference / 2).toString(),
            }).toString(),
          }}
          className={styles.marginRight}
          showSymbol
        />
      </li>
    )
  }

  return (
    <>
      <>
        {getDepositMessage()}
        {getBorrowMessage()}
        {getSwapMessage()}
      </>
      <li>{t('fields.supplyLiquidity', { vault: props.vault.provider })}</li>
    </>
  )
}
