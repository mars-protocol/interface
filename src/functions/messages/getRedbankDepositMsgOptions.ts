export const getRedbankDepositMsgOptions = (
  amount: number,
  denom: string,
): RedbankDepositMsgOptions => {
  return {
    msg: { deposit: {} },
    funds: [{ denom, amount: amount.toFixed(0) }],
  }
}
