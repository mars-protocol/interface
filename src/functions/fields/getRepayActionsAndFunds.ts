import { Action, Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

import { orderCoinsByDenom } from './orderCoinsByDenom'

export const getRepayActionsAndFunds = (coin: Coin, isV2: boolean): [Action[], Coin[]] => {
  const repay = isV2
    ? {
        repay: {
          coin: {
            denom: coin.denom,
            amount: { exact: coin.amount },
          },
        },
      }
    : {
        repay: {
          denom: coin.denom,
          amount: { exact: coin.amount },
        },
      }

  return [
    [
      {
        deposit: coin,
      },
      repay,
    ],
    orderCoinsByDenom([coin]),
  ]
}
