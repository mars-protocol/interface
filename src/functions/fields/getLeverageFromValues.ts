import BigNumber from 'bignumber.js'

export const getLeverageFromValues = (values: {
  primary: number
  secondary: number
  borrowedPrimary: number
  borrowedSecondary: number
  net: number
  total: number
}) =>
  new BigNumber(values.borrowedPrimary)
    .plus(values.borrowedSecondary)
    .div(values.net || 1)
    .plus(1)
    .toNumber()
