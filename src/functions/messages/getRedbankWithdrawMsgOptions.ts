import BigNumber from 'bignumber.js'
import { FEE_EST_AMOUNT } from 'constants/appConstants'

export const getRedbankWithdrawMsgOptions = (
  amount: number,
  denom: string,
): RedbankWithdrawMsgOptions => {
  const msg: RedbankWithdrawMsg = {
    withdraw: {
      denom: denom,
    },
  }

  // If we want to withdraw all our amount, the SC accepts sending no amount and will default to withdrawing all available.
  if (amount && amount > 0) {
    msg.withdraw.amount = amount === 0 ? FEE_EST_AMOUNT : new BigNumber(amount).toFixed(0)
  }

  return { msg }
}
