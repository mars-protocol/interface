import BigNumber from 'bignumber.js'
import { findByDenom } from 'functions/findByDenom'
import { Action, ActionAmount } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export const getClosePositionActions = (
  vault: ActiveVault,
  primaryToSecondaryRate: number,
  slippage: number,
  whitelistedAssets: Asset[],
): Action[] => {
  const swapMessage: Action[] = []

  // Increase the borrow amount by factor to account for an increase of borrow over time
  const borrowAmount = Math.ceil(
    Math.max(vault.position.amounts.borrowedPrimary, vault.position.amounts.borrowedSecondary) *
      1.001,
  )
  const borrowType =
    vault.position.amounts.borrowedPrimary > vault.position.amounts.borrowedSecondary
      ? 'primary'
      : 'secondary'

  const supplyType = borrowType === 'primary' ? 'secondary' : 'primary'
  const borrowAsset = findByDenom(whitelistedAssets, vault.denoms[borrowType])
  const supplyAsset = findByDenom(whitelistedAssets, vault.denoms[supplyType])
  const additionalDecimals = Number(borrowAsset?.decimals ?? 6) - Number(supplyAsset?.decimals ?? 6)

  const availableAmountForRepay = vault.position.amounts.lp[borrowType]
  if (availableAmountForRepay < borrowAmount) {
    const swapTargetAmount = borrowAmount - availableAmountForRepay
    const exchangeRate =
      borrowType === 'secondary'
        ? new BigNumber(1).div(primaryToSecondaryRate)
        : new BigNumber(primaryToSecondaryRate)

    const swapAmount = Math.max(
      exchangeRate
        .times(swapTargetAmount)
        .shiftedBy(-additionalDecimals)
        .integerValue(BigNumber.ROUND_CEIL)
        .toNumber(),
      10,
    )

    swapMessage.push({
      swap_exact_in: {
        coin_in: {
          amount: {
            exact: swapAmount.toString(),
          },
          denom: borrowType === 'secondary' ? vault.denoms.primary : vault.denoms.secondary,
        },
        denom_out: vault.denoms[borrowType],
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
