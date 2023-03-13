import BigNumber from 'bignumber.js'

export const getLeverageFromValues = (values: {
  primary: number
  secondary: number
  borrowedPrimary: number
  borrowedSecondary: number
  net: number
  total: number
}) =>
  Number(
    new BigNumber(
      values.borrowedPrimary > values.borrowedSecondary
        ? values.borrowedPrimary
        : values.borrowedSecondary,
    )
      .div(values.net || 1)
      .plus(1),
  )
