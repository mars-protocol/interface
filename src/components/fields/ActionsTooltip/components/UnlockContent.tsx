import { TokenBalance } from 'components/common'
import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './Content.module.scss'

interface Props {
  vault: Vault
  position: Position
}
export const UnlockContent = (props: Props) => {
  const { t } = useTranslation()

  return (
    <>
      <li>{t('fields.removeLiquidity', { vault: props.vault.provider })}</li>
      <li>
        {props.position.borrowDenom && (
          <>
            <span className={styles.marginRight}>{t('redbank.repay')}</span>
            <TokenBalance
              coin={{
                denom: props.position.borrowDenom,
                amount: Math.max(
                  props.position.amounts.borrowedPrimary,
                  props.position.amounts.borrowedSecondary,
                ).toString(),
              }}
              showSymbol
            />
          </>
        )}
      </li>
      <li>
        <span className={styles.marginRight}>{t('redbank.withdraw')}</span>
        <TokenBalance
          coin={{
            denom: props.vault.denoms.primary,
            amount: props.position.amounts.primary.toString(),
          }}
          className={styles.marginRight}
          showSymbol
        />
        {props.position.amounts.secondary > 0 && (
          <>
            <span className={styles.marginRight}>{t('common.and')}</span>
            <TokenBalance
              coin={{
                denom: props.vault.denoms.secondary,
                amount: props.position.amounts.secondary.toString(),
              }}
              showSymbol
            />
          </>
        )}
      </li>
    </>
  )
}
