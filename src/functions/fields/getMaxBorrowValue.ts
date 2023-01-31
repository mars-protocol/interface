import BigNumber from 'bignumber.js'
import { ltvToLeverage } from 'libs/parse'

export const getMaxBorrowValue = (vault: Vault, position: Position): number => {
  return new BigNumber(ltvToLeverage(vault.ltv.max)).minus(1).times(position.values.net).toNumber()
}
