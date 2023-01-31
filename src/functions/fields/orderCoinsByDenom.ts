import { Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export const orderCoinsByDenom = (coins: Coin[]) =>
  coins.sort((a, b) => {
    if (a.denom < b.denom) return -1
    if (a.denom > b.denom) return 1
    return 0
  })
