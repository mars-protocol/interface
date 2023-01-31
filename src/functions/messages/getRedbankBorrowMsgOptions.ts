import { FEE_EST_AMOUNT } from 'constants/appConstants'

export const getRedbankBorrowMsgOptions = (
  amount: number,
  denom: string,
): RedbankBorrowMsgOptions => {
  return {
    msg: {
      borrow: {
        denom,
        amount: amount === 0 ? FEE_EST_AMOUNT : amount.toFixed(0),
      },
    },
  }
}
