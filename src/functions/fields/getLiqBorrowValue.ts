export const getLiqBorrowValue = (vault: Vault, maxBorrowValue: number) => {
  return ((vault.ltv.liq - vault.ltv.max) / vault.ltv.max + 1) * maxBorrowValue
}
