import BN from 'bignumber.js'

export const plus = (a?: BN.Value, b?: BN.Value): string => new BN(a || 0).plus(b || 0).toString()

export const times = (a?: BN.Value, b?: BN.Value): string => new BN(a || 0).times(b || 0).toString()

export const ceil = (n: BN.Value): string => new BN(n).integerValue(BN.ROUND_CEIL).toString()

export const safeGetInputPercentage = (value: number) => {
  let increasePercentage = 0
  if (value >= 0) {
    increasePercentage = value / 100
  }
  return increasePercentage
}

export const addDecimals = (value: number | string) => {
  return Number(value).toLocaleString('en', {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export const convertToUSD = (value: number | string) => {
  return Number(value).toLocaleString('en', {
    style: 'currency',
    currency: 'USD',
  })
}

export const addTax = (value: number | string) => {
  return (Number(value) * 1.001).toFixed(0)
}

export const countDecimals = (value: number) => {
  if (Math.floor(value) === value) return 0
  return value.toString().split('.')[1].length || 0
}
