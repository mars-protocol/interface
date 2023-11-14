import { TokenBalance } from 'components/common'
import { useTranslation } from 'react-i18next'

import styles from './Content.module.scss'

interface Props {
  repayAmount: number
  vault: Vault
}
export const RepayContent = (props: Props) => {
  const { t } = useTranslation()
  if (!props.repayAmount) return null

  return (
    <>
      <li>
        <span className={styles.marginRight}>{t('redbank.deposit')}</span>
        <TokenBalance
          coin={{
            denom: props.vault.denoms.secondary,
            amount: props.repayAmount.toString(),
          }}
          maxDecimals={6}
          showSymbol
        />
      </li>
      <li>
        <span className={styles.marginRight}>{t('redbank.repay')}</span>
        <TokenBalance
          coin={{
            denom: props.vault.denoms.secondary,
            amount: props.repayAmount.toString(),
          }}
          maxDecimals={6}
          showSymbol
        />
      </li>
    </>
  )
}
