import BigNumber from 'bignumber.js'

export const getLeverageFromSlider = (percentage: number, maxLeverage: number) =>
  new BigNumber(percentage)
    .times(maxLeverage - 1)
    .dividedBy(100)
    .plus(1)
    .toNumber()
