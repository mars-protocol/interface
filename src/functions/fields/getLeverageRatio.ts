import BigNumber from 'bignumber.js'

export const getLeverageRatio = (leverageLimit: number, maxLeverage: number) => {
  return new BigNumber(leverageLimit)
    .minus(1)
    .div(new BigNumber(maxLeverage).minus(1))
    .times(100)
    .toNumber()
}
