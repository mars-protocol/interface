import classNames from 'classnames'
import { Tutorial } from 'components/common'
import { TokenInput } from 'components/fields'
import { FIELDS_TUTORIAL_KEY } from 'constants/appConstants'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './BorrowInput.module.scss'

interface Props {
  vault: Vault
  borrowAmount: number
  maxAmount: number
  onChange: (amount: number) => void
}

export const BorrowInput = (props: Props) => {
  const { t } = useTranslation()
  const redBankAssets = useStore((s) => s.redBankAssets)
  const showTutorial = !localStorage.getItem(FIELDS_TUTORIAL_KEY)
  const asset = redBankAssets.find((asset) => asset.denom === props.vault.denoms.secondary)
  const containerClasses = classNames([styles.container])
  const input: Input = {
    visible: true,
    denom: props.vault.denoms.secondary,
    symbol: props.vault.symbols.secondary,
  }

  const tokenInput = (
    <TokenInput
      input={input}
      amount={props.borrowAmount}
      maxAmount={props.maxAmount}
      maxAmountLabel={t('global.max')}
      onChange={props.onChange}
      tokens={[props.vault.symbols.secondary]}
      borrowRate={asset?.borrowRate}
    />
  )

  return (
    <div className={containerClasses}>
      <p className='sCaps'>{t('common.borrow')}</p>
      {showTutorial ? (
        <Tutorial step={3} type='fields' availableVault={props.vault}>
          {tokenInput}
        </Tutorial>
      ) : (
        <>{tokenInput}</>
      )}
    </div>
  )
}
