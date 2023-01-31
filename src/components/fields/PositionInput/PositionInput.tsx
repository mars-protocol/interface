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
  const [maxAllowedLeverage, setMaxAllowedLeverage] = useState(ltvToLeverage(props.vault.ltv.max))
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
    const borrowValue = convertToBaseCurrency({
      denom: props.vault.denoms.secondary,
      amount: position.amounts.borrowed.toString(),
    })
    position.values.borrowed = borrowValue
    position.values.total = borrowValue + primaryValue + secondaryValue
    position.values.net = primaryValue + secondaryValue
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

  const onBorrowChange = (amount: number) => {
    const borrowValue = convertToBaseCurrency({
      denom: props.vault.denoms.secondary,
      amount: amount.toString(),
    })
    props.position.amounts.borrowed = amount
    props.position.values.borrowed = borrowValue
    props.position.currentLeverage = getLeverageFromValues(props.position.values)
    props.setPosition({ ...updateValues(props.position) })
  }

  const computeMaxAllowedLeverage = () => {
    const maxBorrowValue = convertToBaseCurrency({
      denom: props.vault.denoms.secondary,
      amount: computeMaxBorrowAmount().toString(),
    })

    return maxBorrowValue >= 0
      ? getMaxAllowedLeverage(
          maxBorrowValue,
          props.position.values.primary,
          props.position.values.secondary,
        )
      : ltvToLeverage(props.vault.ltv.max)
  }

  const computeBorrowAmount = (leverage?: number) => {
    const supplyBorrowRatio = leverage ? leverage - 1 : props.position.currentLeverage - 1
    const supplyValue = props.position.values.primary + props.position.values.secondary
    const borrowValue = new BigNumber(supplyValue).times(supplyBorrowRatio).toNumber()
    const borrowAmount = Math.floor(
      convertValueToAmount({
        denom: props.vault.denoms.secondary,
        amount: borrowValue.toString(),
      }),
    )

    const targetLeverage = leverage
      ? leverage
      : borrowValue / supplyValue >= 0
      ? borrowValue / supplyValue + 1
      : props.position.currentLeverage
    const maxAllowedLeverage = computeMaxAllowedLeverage()

    if (targetLeverage > maxAllowedLeverage) {
      const borrowAmount = computeMaxBorrowAmount()
      props.position.amounts.borrowed = borrowAmount
      props.position.currentLeverage = maxAllowedLeverage
    } else {
      props.position.amounts.borrowed = borrowAmount
      props.position.currentLeverage = targetLeverage
    }

    props.setPosition({ ...updateValues(props.position) })
    setMaxAllowedLeverage(maxAllowedLeverage)
  }

  const computeMaxBorrowAmount = () => {
    const maxAmount = Math.floor(
      convertValueToAmount({
        denom: props.vault.denoms.secondary,
        amount: getMaxBorrowValue(props.vault, props.position).toString(),
      }),
    )

    const marketLiquidity = Number(
      marketAssetLiquidity.find((market) => market.denom === props.vault.denoms.secondary)
        ?.amount || 0,
    )

    const maxBorrowAmount = Math.min(
      maxAmount,
      (props.prevPosition?.amounts.borrowed || 0) + marketLiquidity,
    )

    if (props.prevPosition) {
      return Math.max(maxBorrowAmount, props.prevPosition.amounts.borrowed)
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
            ltvToLeverage(props.vault.ltv.max),
            props.prevPosition?.currentLeverage || 1,
          )}
          onChange={computeBorrowAmount}
        />
      </Highlight>
      <Highlight show={tutorialStep === 3 || !showTutorial} className={styles.borrow}>
        <BorrowInput
          borrowAmount={props.position.amounts.borrowed}
          onChange={onBorrowChange}
          maxAmount={computeMaxBorrowAmount()}
          vault={props.vault}
        />
      </Highlight>
    </div>
  )
}
