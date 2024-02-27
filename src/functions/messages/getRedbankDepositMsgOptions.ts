import BigNumber from 'bignumber.js'

export const getRedbankDepositMsgOptions = (
  amount: number,
  denom: string,
): RedbankDepositMsgOptions => {
  return {
    msg: { deposit: {} },
    funds: [{ denom, amount: new BigNumber(amount).toFixed(0) }],
  }
}
