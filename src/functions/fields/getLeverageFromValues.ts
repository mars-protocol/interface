import BigNumber from 'bignumber.js'

export const getLeverageFromValues = (values: {
  primary: number
  secondary: number
  borrowed: number
  net: number
  total: number
}) => Number(new BigNumber(values.borrowed).div(values.net || 1).plus(1))
