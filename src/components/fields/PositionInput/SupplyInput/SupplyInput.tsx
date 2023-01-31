import classNames from 'classnames/bind'
import { Button, SVG, Tutorial } from 'components/common'
import { TokenInput } from 'components/fields'
import { FIELDS_TUTORIAL_KEY } from 'constants/appConstants'
import { findByDenom } from 'functions'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

import styles from './SupplyInput.module.scss'

interface Props {
  vault: Vault
  prevPosition?: Position
  primaryAmount: number
  secondaryAmount: number
  className?: string
  onChangePrimary: (amount: number) => void
  onChangeSecondary: (amount: number) => void
}

export const SupplyInput = (props: Props) => {
  const { t } = useTranslation()
  const userBalances = useStore((s) => s.userBalances)

  const [cachedPrimaryAmount, setCachedPrimaryAmount] = useState(props.primaryAmount)
  const [cachedSecondaryAmount, setCachedSecondaryAmount] = useState(props.secondaryAmount)
  const containerClasses = classNames([props.className, styles.container])
  const [primaryInput, setPrimaryInput] = useState<Input>({
    visible: true,
    denom: props.vault.denoms.primary,
    symbol: props.vault.symbols.primary,
  })
  const [secondaryInput, setSecondaryInput] = useState<Input>({
    visible: !!props.secondaryAmount || !!props.prevPosition,
    denom: props.vault.denoms.secondary,
    symbol: props.vault.symbols.secondary,
  })

  const showTutorial = !localStorage.getItem(FIELDS_TUTORIAL_KEY)

  const selectInput = (symbol: string) => {
    if (symbol === primaryInput.symbol) {
      primaryInput.visible = true
      secondaryInput.visible = false
      setCachedSecondaryAmount(cachedSecondaryAmount)
      props.onChangePrimary(cachedPrimaryAmount)
      props.onChangeSecondary(0)
    } else {
      primaryInput.visible = false
      secondaryInput.visible = true
      setCachedPrimaryAmount(cachedPrimaryAmount)
      props.onChangeSecondary(cachedSecondaryAmount)
      props.onChangePrimary(0)
    }

    setPrimaryInput({ ...primaryInput })
    setSecondaryInput({ ...secondaryInput })
  }

  const btnHandler = () => {
    if (primaryInput.visible && secondaryInput.visible) {
      setSecondaryInput({ ...secondaryInput, visible: false })
      props.onChangeSecondary(0)
      return
    }
    showBothInputs()
  }

  const showBothInputs = () => {
    setSecondaryInput({ ...secondaryInput, visible: true })
    setPrimaryInput({ ...primaryInput, visible: true })
    props.onChangePrimary(cachedPrimaryAmount)
    props.onChangeSecondary(cachedSecondaryAmount)
  }

  const onChangePrimary = (amount: number) => {
    setCachedPrimaryAmount(amount)
    props.onChangePrimary(amount)
  }

  const onChangeSecondary = (amount: number) => {
    setCachedSecondaryAmount(amount)
    props.onChangeSecondary(amount)
  }

  const primaryWalletBalance = Number(
    (findByDenom(userBalances, props.vault.denoms.primary) as Coin)?.amount || 0,
  )
  const secondaryWalletBalance = Number(
    (findByDenom(userBalances, props.vault.denoms.secondary) as Coin)?.amount || 0,
  )

  const prevPrimaryAmount = props.prevPosition?.amounts.primary || 0
  const prevSecondaryAmount = props.prevPosition?.amounts.secondary || 0

  const tokenInputs = (
    <div className={styles.inputs}>
      {primaryInput.visible && (
        <TokenInput
          input={primaryInput}
          amount={props.primaryAmount}
          onChange={onChangePrimary}
          tokens={
            secondaryInput.visible
              ? [primaryInput.symbol]
              : [primaryInput.symbol, secondaryInput.symbol]
          }
          onSelect={selectInput}
          maxAmountLabel={t('global.max')}
          maxAmount={primaryWalletBalance + prevPrimaryAmount}
        />
      )}
      {secondaryInput.visible && (
        <TokenInput
          input={secondaryInput}
          amount={props.secondaryAmount}
          onChange={onChangeSecondary}
          tokens={
            primaryInput.visible
              ? [secondaryInput.symbol]
              : [primaryInput.symbol, secondaryInput.symbol]
          }
          onSelect={selectInput}
          maxAmountLabel={t('global.max')}
          maxAmount={secondaryWalletBalance + prevSecondaryAmount}
        />
      )}
      {!props.prevPosition && (
        <Button
          color='tertiary'
          onClick={btnHandler}
          variant='round'
          prefix={secondaryInput.visible && primaryInput.visible ? <SVG.Subtract /> : <SVG.Add />}
          className={styles.button}
        />
      )}
    </div>
  )

  return (
    <div className={containerClasses}>
      <div className={styles.containerInner}>
        <p className={styles.headline}>{t('fields.netValue')}</p>
        {showTutorial ? (
          <Tutorial step={1} type='fields' availableVault={props.vault} className={styles.inputs}>
            {tokenInputs}
          </Tutorial>
        ) : (
          <>{tokenInputs}</>
        )}
      </div>
    </div>
  )
}
