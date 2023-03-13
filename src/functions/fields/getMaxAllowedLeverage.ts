import BigNumber from 'bignumber.js'

export const getMaxAllowedLeverage = (
  borrowValue: number,
  primaryValue: number,
  secondaryValue: number,
) =>
  Number(
    new BigNumber(borrowValue)
      .div(new BigNumber(primaryValue).plus(secondaryValue))
      .plus(1)
      .toPrecision(4),
  )
