export type Action =
  | StrategyDeposit
  | StrategyBorrow
  | StrategyRepay
  | StrategyWithdraw
  | StrategyBond
  | StrategyUnbond

export type ContractMsg =
  | StrategyDeposit
  | StrategyBorrow
  | StrategyRepay
  | StrategyWithdraw
  | StrategyBond
  | StrategyUnbond
  | StrategyDepositMsg

export type MsgExecuteContract = Record<string, unknown>
