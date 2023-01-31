interface RedbankDepositMsg {
  deposit: {}
}

interface RedbankWithdrawMsg {
  withdraw: {
    denom: string
    amount?: string
  }
}

interface RedbankBorrowMsg {
  borrow: {
    amount: string
    denom: string
  }
}

interface RedbankRepayMsg {
  repay: {}
}

interface RedbankDepositMsgOptions {
  msg: RedbankDepositMsg
  funds: import('@cosmjs/stargate').Coin[]
}

interface RedbankRepayMsgOptions {
  msg: RedbankRepayMsg
  funds: import('@cosmjs/stargate').Coin[]
}

interface RedbankWithdrawMsgOptions {
  msg: RedbankWithdrawMsg
}

interface RedbankBorrowMsgOptions {
  msg: RedbankBorrowMsg
}
