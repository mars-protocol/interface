import classNames from 'classnames'
import { Tutorial } from 'components/common'
import { TokenInput } from 'components/fields'
import { FIELDS_TUTORIAL_KEY } from 'constants/appConstants'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './BorrowInput.module.scss'

interface Props {
  vault: Vault
  borrowedPrimaryAmount: number
  borrowedSecondaryAmount: number
  maxAmount: number
  prevPosition?: Position
  onChangePrimary: (amount: number) => void
  onChangeSecondary: (amount: number) => void
}

export const BorrowInput = (props: Props) => {
  const { t } = useTranslation()
  const redBankAssets = useStore((s) => s.redBankAssets)
  const showTutorial = !localStorage.getItem(FIELDS_TUTORIAL_KEY)
  const primaryAsset = redBankAssets.find((asset) => asset.denom === props.vault.denoms.primary)
  const secondaryAsset = redBankAssets.find((asset) => asset.denom === props.vault.denoms.secondary)
  const containerClasses = classNames([styles.container])
  const [cachedPrimaryAmount, setCachedPrimaryAmount] = useState(props.borrowedPrimaryAmount)
  const [cachedSecondaryAmount, setCachedSecondaryAmount] = useState(props.borrowedSecondaryAmount)

  const primaryInputVisisble =
    props.borrowedPrimaryAmount > 0 ||
    props.prevPosition?.borrowDenom === props.vault.denoms.primary
      ? true
      : false

  const [primaryInput, setPrimaryInput] = useState<Input>({
    visible: primaryInputVisisble,
    denom: props.vault.denoms.primary,
    symbol: props.vault.symbols.primary,
  })

  const [secondaryInput, setSecondaryInput] = useState<Input>({
    visible: !primaryInputVisisble,
    denom: props.vault.denoms.secondary,
    symbol: props.vault.symbols.secondary,
  })

  const selectInput = (symbol: string) => {
    if (symbol === primaryInput.symbol) {
      primaryInput.visible = true
      secondaryInput.visible = false
      setCachedSecondaryAmount(props.borrowedSecondaryAmount)
      props.onChangePrimary(cachedPrimaryAmount)
    } else {
      primaryInput.visible = false
      secondaryInput.visible = true
      setCachedPrimaryAmount(props.borrowedPrimaryAmount)
      props.onChangeSecondary(cachedSecondaryAmount)
    }

    setPrimaryInput({ ...primaryInput })
    setSecondaryInput({ ...secondaryInput })
  }

  const onChangePrimary = (amount: number) => {
    setCachedPrimaryAmount(amount)
    props.onChangePrimary(amount)
  }

  const onChangeSecondary = (amount: number) => {
    setCachedSecondaryAmount(amount)
    props.onChangeSecondary(amount)
  }

  const tokenInput = (
    <>
      {primaryInput.visible && (
        <TokenInput
          input={primaryInput}
          amount={props.borrowedPrimaryAmount}
          onChange={onChangePrimary}
          tokens={
            props.prevPosition?.borrowDenom === props.vault.denoms.primary
              ? [primaryInput.symbol]
              : [primaryInput.symbol, secondaryInput.symbol]
          }
          onSelect={selectInput}
          maxAmountLabel={t('global.max')}
          maxAmount={props.maxAmount}
          borrowRate={primaryAsset?.borrowRate}
          disableGasWarning
        />
      )}
      {secondaryInput.visible && (
        <TokenInput
          input={secondaryInput}
          amount={props.borrowedSecondaryAmount}
          onChange={onChangeSecondary}
          tokens={
            props.prevPosition?.borrowDenom === props.vault.denoms.secondary
              ? [secondaryInput.symbol]
              : [primaryInput.symbol, secondaryInput.symbol]
          }
          onSelect={selectInput}
          maxAmountLabel={t('global.max')}
          maxAmount={props.maxAmount}
          borrowRate={secondaryAsset?.borrowRate}
          disableGasWarning
        />
      )}
    </>
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
