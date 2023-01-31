import { FEE_EST_AMOUNT } from 'constants/appConstants'

export const getRedbankRepayMsgOptions = (
  amount: number,
  denom: string,
  userBalance: number,
  isMax?: boolean,
): RedbankRepayMsgOptions => {
  // For repay, we need to slightly overpay to ensure the debt is cleared. Any excess is refunded to us.
  const OVERPAY_SCALER = 1.001
  let adjustedAmount = Number(amount)

  if (isMax) {
    // Debt is stored with 12 points of accuracy instead of 6 so it's possible we have e.g. > 0.000001 (1 micro unit)
    // but < 0.000002 debt (2 micro unit).
    // In these cases it is not enough to multiply debt by OVERPAY_SCALER to safely overpay and thus clear debt.
    // If the user has less than 1000 micro units of debt remaining on UI we should use a different formula of adding an entire micro unit
    const overpayAmount =
      adjustedAmount > 1000 ? adjustedAmount * OVERPAY_SCALER : adjustedAmount + 1

    // Can't overpay if user doesn't have the balance in their wallet to overpay
    adjustedAmount = overpayAmount > userBalance ? userBalance : overpayAmount
  }

  return {
    msg: { repay: {} },
    funds: [
      {
        denom,
        amount: adjustedAmount === 0 ? FEE_EST_AMOUNT : adjustedAmount.toFixed(0),
      },
    ],
  }
}
