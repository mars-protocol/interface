import { findAssetByDenom, formatValue, lookup } from 'libs/parse'
import { Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export const getTokenValueFromCoins = (assets: Asset[], coins: Coin[] = []) => {
  return coins.map((token) => {
    const asset = findAssetByDenom(token.denom, assets)

    if (!asset) return ''

    const convertedValue = lookup(Number(token.amount), asset.symbol, asset.decimals)

    return formatValue(convertedValue, 2, asset.decimals, true, false, ` ${asset.symbol}`)
  })
}
