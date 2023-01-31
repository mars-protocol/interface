import { findAssetByDenom, formatValue } from 'libs/parse'
import { Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export const getTokenValueFromCoins = (assets: Asset[], coins: Coin[] = []) => {
  return coins.map((token) => {
    const asset = findAssetByDenom(token.denom, assets)

    if (!asset) return ''

    return `${formatValue(Number(token.amount) / 10 ** asset.decimals, 2, 2, true)} ${asset.symbol}`
  })
}
