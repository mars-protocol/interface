import { formatValue } from 'libs/parse'

export const formatToValueSymbol = (amount: number, asset: Asset) => {
  return `${formatValue(amount / Number(`1e${asset.decimals}`), 2, asset.decimals)} ${asset.symbol}`
}
