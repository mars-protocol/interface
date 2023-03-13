import { Action, ActionAmount } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export const getClosePositionActions = (
  vault: ActiveVault,
  exchangeRate: number,
  slippage: number,
): Action[] => {
  const swapMessage: Action[] = []

  // Increase the borrow amount by factor to account for an increase of borrow over time
  const borrowAmount = Math.ceil(
    Math.max(vault.position.amounts.borrowedPrimary, vault.position.amounts.borrowedSecondary) *
      1.001,
  )
  const secondaryAmount = vault.position.amounts.lp.secondary

  if (secondaryAmount < borrowAmount) {
    const swapTargetAmount = borrowAmount - secondaryAmount
    const swapAmount = Math.max(Math.ceil(swapTargetAmount / exchangeRate), 10)
    swapMessage.push({
      swap_exact_in: {
        coin_in: {
          amount: {
            exact: swapAmount.toString(),
          },
          denom: vault.denoms.primary,
        },
        denom_out: vault.denoms.secondary,
        slippage: slippage.toString(),
      },
    })
  }

  return [
    {
      exit_vault_unlocked: {
        id: vault.position.id || 0,
        vault: {
          address: vault.address,
        },
      },
    },
    {
      withdraw_liquidity: {
        lp_token: {
          amount: 'account_balance',
          denom: vault.denoms.lpToken,
        },
      },
    },
    ...swapMessage,
    ...(Math.max(vault.position.amounts.borrowedPrimary, vault.position.amounts.borrowedSecondary)
      ? [
          {
            repay: {
              denom: vault.position.borrowDenom || vault.denoms.secondary,
              amount: 'account_balance' as ActionAmount,
            },
          },
        ]
      : []),
    { refund_all_coin_balances: {} },
  ]
}
