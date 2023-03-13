import BigNumber from 'bignumber.js'
import { Backdrop, Highlight } from 'components/common'
import { BorrowInput, LeverageSlider, SupplyInput } from 'components/fields'
import { FIELDS_TUTORIAL_KEY } from 'constants/appConstants'
import { getLeverageFromValues, getMaxAllowedLeverage, getMaxBorrowValue } from 'functions/fields'
import { ltvToLeverage } from 'libs/parse'
import React, { useState } from 'react'
import useStore from 'store'

import styles from './PositionInput.module.scss'

interface Props {
  vault: Vault
  position: Position
  prevPosition?: Position
  setPosition: React.Dispatch<React.SetStateAction<Position>>
}

export const PositionInput = (props: Props) => {
  const marketAssetLiquidity = useStore((s) => s.marketAssetLiquidity)
  const convertToBaseCurrency = useStore((s) => s.convertToBaseCurrency)
  const convertValueToAmount = useStore((s) => s.convertValueToAmount)
  const [maxAllowedLeverage, setMaxAllowedLeverage] = useState(
    ltvToLeverage(props.vault.ltv.contract),
  )
  const tutorialStep = useStore((s) => s.tutorialSteps['fields'])
  const showTutorial = !localStorage.getItem(FIELDS_TUTORIAL_KEY)

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
    position.values.borrowedPrimary = borrowedPrimaryValue
    position.values.borrowedSecondary = borrowedSecondaryValue
    position.values.total =
      borrowedPrimaryValue + borrowedSecondaryValue + primaryValue + secondaryValue
    position.values.net = primaryValue + secondaryValue

    if (borrowedPrimaryValue > 0) {
      props.position.borrowDenom = props.vault.denoms.primary
    } else if (borrowedSecondaryValue > 0) {
      props.position.borrowDenom = props.vault.denoms.secondary
    }

    return position
  }

  const onSupplyChange = (amount: number, type: 'primary' | 'secondary') => {
    props.position.amounts[type] = amount
    props.position.values[type] = convertToBaseCurrency({
      denom: props.vault.denoms[type],
      amount: amount.toString(),
    })
    props.setPosition({ ...updateValues(props.position) })
    computeBorrowAmount()
  }

  const onBorrowChange = (amount: number, type: 'primary' | 'secondary') => {
    props.position.borrowDenom =
      type === 'primary' ? props.vault.denoms.primary : props.vault.denoms.secondary
    const borrowValue = convertToBaseCurrency({
      denom: props.position.borrowDenom,
      amount: amount.toString(),
    })
    const borrowKey = type === 'primary' ? 'borrowedPrimary' : 'borrowedSecondary'
    const secondaryBorrowKey = type !== 'primary' ? 'borrowedPrimary' : 'borrowedSecondary'
    props.position.amounts[borrowKey] = amount
    props.position.amounts[secondaryBorrowKey] = 0
    props.position.values[borrowKey] = borrowValue
    props.position.values[secondaryBorrowKey] = 0
    props.position.currentLeverage = getLeverageFromValues(props.position.values)
    props.setPosition({ ...updateValues(props.position) })
    computeBorrowAmount()
  }

  const computeMaxAllowedLeverage = () => {
    const maxBorrowValue = convertToBaseCurrency({
      denom: props.position.borrowDenom || props.vault.denoms.secondary,
      amount: computeMaxBorrowAmount().toString(),
    })

    return maxBorrowValue >= 0
      ? getMaxAllowedLeverage(
          maxBorrowValue,
          props.position.values.primary,
          props.position.values.secondary,
        )
      : ltvToLeverage(props.vault.ltv.contract)
  }

  const computeBorrowAmount = (leverage?: number) => {
    const supplyBorrowRatio = leverage ? leverage - 1 : props.position.currentLeverage - 1
    const supplyValue = props.position.values.primary + props.position.values.secondary
    const borrowValue = new BigNumber(supplyValue).times(supplyBorrowRatio).toNumber()
    const borrowDenom = props.position.borrowDenom
      ? props.position.borrowDenom
      : props.vault.denoms.secondary

    const borrowAmount = Math.floor(
      convertValueToAmount({
        denom: borrowDenom,
        amount: borrowValue.toString(),
      }),
    )

    const targetLeverage = leverage
      ? leverage
      : borrowValue / supplyValue >= 0
      ? borrowValue / supplyValue + 1
      : props.position.currentLeverage
    const maxAllowedLeverage = computeMaxAllowedLeverage()

    const borrowKey =
      borrowDenom === props.vault.denoms.primary ? 'borrowedPrimary' : 'borrowedSecondary'

    if (targetLeverage > maxAllowedLeverage) {
      const borrowAmount = computeMaxBorrowAmount()
      props.position.amounts[borrowKey] = borrowAmount
      props.position.currentLeverage = maxAllowedLeverage
    } else {
      props.position.amounts[borrowKey] = borrowAmount
      props.position.currentLeverage = targetLeverage
    }

    props.setPosition({ ...updateValues(props.position) })
    setMaxAllowedLeverage(maxAllowedLeverage)
  }

  const computeMaxBorrowAmount = () => {
    const borrowDenom = props.position.borrowDenom || props.vault.denoms.secondary

    const maxAmount = Math.floor(
      convertValueToAmount({
        denom: borrowDenom,
        amount: getMaxBorrowValue(props.vault, props.position).toString(),
      }),
    )

    const marketLiquidity = Number(
      marketAssetLiquidity.find((market) => market.denom === borrowDenom)?.amount || 0,
    )
    const borrowKey =
      borrowDenom === props.vault.denoms.primary ? 'borrowedPrimary' : 'borrowedSecondary'

    const maxBorrowAmount = Math.min(
      maxAmount,
      (props.prevPosition?.amounts[borrowKey] || 0) + marketLiquidity,
    )

    if (props.prevPosition) {
      return Math.max(maxBorrowAmount, props.prevPosition.amounts[borrowKey])
    }

    return maxBorrowAmount
  }

  return (
    <div className={styles.grid}>
      <Backdrop show={showTutorial} />
      <Highlight show={tutorialStep === 1 || !showTutorial} className={styles.supply}>
        <SupplyInput
          primaryAmount={props.position.amounts.primary}
          secondaryAmount={props.position.amounts.secondary}
          onChangePrimary={(amount) => onSupplyChange(amount, 'primary')}
          onChangeSecondary={(amount) => onSupplyChange(amount, 'secondary')}
          vault={props.vault}
          prevPosition={props.prevPosition}
        />
      </Highlight>
      <Highlight show={tutorialStep === 2 || !showTutorial} className={styles.leverage}>
        <LeverageSlider
          vault={props.vault}
          leverage={props.position.currentLeverage || 1}
          leverageLimit={maxAllowedLeverage}
          leverageMax={Math.max(
            ltvToLeverage(props.vault.ltv.contract),
            props.prevPosition?.currentLeverage || 1,
          )}
          onChange={computeBorrowAmount}
        />
      </Highlight>
      <Highlight show={tutorialStep === 3 || !showTutorial} className={styles.borrow}>
        <BorrowInput
          borrowedPrimaryAmount={props.position.amounts.borrowedPrimary}
          borrowedSecondaryAmount={props.position.amounts.borrowedSecondary}
          onChangePrimary={(amount) => onBorrowChange(amount, 'primary')}
          onChangeSecondary={(amount) => onBorrowChange(amount, 'secondary')}
          maxAmount={computeMaxBorrowAmount()}
          vault={props.vault}
          prevPosition={props.prevPosition}
        />
      </Highlight>
    </div>
  )
}
