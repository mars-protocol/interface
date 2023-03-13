import BigNumber from 'bignumber.js'
import { ltvToLeverage } from 'libs/parse'

export const getLiqBorrowValue = (vault: Vault, netValue: number) => {
  const liqLev = ltvToLeverage(vault.ltv.liq)

  return new BigNumber(netValue).times(liqLev - 1).toNumber()
}
