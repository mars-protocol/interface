export const maxBorrowableAmount = (
  totalLiquidity: number,
  availableBalance: number,
  currentAssetPrice: number,
): number => {
  if (currentAssetPrice <= 0) return 0
  const maxBorrow = availableBalance / currentAssetPrice
  return totalLiquidity > maxBorrow ? maxBorrow : totalLiquidity
}
