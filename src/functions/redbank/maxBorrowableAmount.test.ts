import { maxBorrowableAmount } from './maxBorrowableAmount'

describe('maxBorrowableAmount', () => {
  const totalLiquidity = 100
  const availableBalance = 100
  const assetPrice = 1.5

  test('should return availableBalance / currentAssetPrice when totalLiquidity is larger', () => {
    const amount = maxBorrowableAmount(totalLiquidity, availableBalance, assetPrice)
    expect(amount).toBe(availableBalance / assetPrice)
  })

  test('should return 0 when there is no available balance', () => {
    const amount = maxBorrowableAmount(totalLiquidity, 0, assetPrice)
    expect(amount).toBe(0)
  })

  test('should return totalLiquidity when maxBorrow is exceeding totalLiquidity', () => {
    const totalLiquidity = 0
    const amount = maxBorrowableAmount(totalLiquidity, availableBalance, assetPrice)
    expect(amount).toBe(totalLiquidity)
  })

  test('should return 0 when the assetPrice is 0', () => {
    const amount = maxBorrowableAmount(totalLiquidity, availableBalance, 0)
    expect(amount).toBe(0)
  })
})
