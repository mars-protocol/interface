interface StrategyNative {
  native: string
}
interface StrategyAsset {
  info: StrategyNative
  amount: string
}

interface StrategyDeposit {
  deposit: {
    info: StrategyNative
    amount: string
  }
}

interface StrategyWithdraw {}

interface StrategyRepay {
  amount: string
}

interface StrategyBorrow {
  borrow: {
    amount: string
  }
}

interface StrategyBond {}

interface StrategyUnbond {
  amount: string
}

interface StrategyDepositMsg {
  deposit_native: {
    denom: string
  }
}

interface StrategyExecuteMsgOptions {
  msg: import('types/types').ContractMsg
  funds?: import('@cosmjs/stargate').Coin[]
  contract: string
  fee: import('@cosmjs/stargate').StdFee
  sender?: string
}
