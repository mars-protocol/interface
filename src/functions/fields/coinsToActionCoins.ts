import {
  ActionAmount,
  ActionCoin,
  Coin,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export const coinsToActionCoins = (coins: Coin[]): ActionCoin[] =>
  coins
    .map((coin) => ({ denom: coin.denom, amount: 'account_balance' as ActionAmount }))
    .sort((a, b) => {
      if (a.denom < b.denom) return -1
      if (a.denom > b.denom) return 1
      return 0
    })
