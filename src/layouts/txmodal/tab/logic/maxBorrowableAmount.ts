export const maxBorrowableAmount = (
    totalLiquidity: number,
    availableBalance: number,
    currentAssetPrice: number
): number => {
    const maxBorrow = availableBalance / currentAssetPrice
    return totalLiquidity > maxBorrow ? maxBorrow : totalLiquidity
}
