import { Action, Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

import { orderCoinsByDenom } from './orderCoinsByDenom'

export const getRepayActionsAndFunds = (coin: Coin): [Action[], Coin[]] => {
  return [
    [
      {
        deposit: coin,
      },
      {
        repay: {
          denom: coin.denom,
          amount: { exact: coin.amount },
        },
      },
    ],
    orderCoinsByDenom([coin]),
  ]
}
