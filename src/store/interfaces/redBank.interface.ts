import { Coin } from '@cosmjs/stargate'
import { UserDebtData } from 'hooks/queries/useUserDebt'
import { UserDepositData } from 'hooks/queries/useUserDeposit'
import { State } from 'types/enums'

export interface RedBankSlice {
  // ------------------
  // VARIABLES
  // ------------------
  marketAssetLiquidity: Coin[]
  marketIncentiveInfo: MarketIncentive[]
  marketInfo: Market[]
  redBankAssets: RedBankAsset[]
  redBankState: State
  userBalancesState: State
  userCollateral?: UserCollateral[]
  userDebts?: Coin[]
  userDeposits?: Coin[]
  // ------------------
  // GENERAL FUNCTIONS
  // ------------------
  calculateIncentiveAssetInfo: (
    incentive?: MarketIncentive | Record<string, any>,
    marketTotalLiquidity?: Coin,
  ) => IncentiveInfo | undefined
  computeMarketLiquidity: (denom: string) => number
  findUserDebt: (denom: string) => number
  findUserDeposit: (denom: string) => number
  findCollateral: (denom: string) => UserCollateral | undefined

  // SETTERS
  // ------------------
  setRedBankAssets: () => void
  setUserBalancesState: (userBalancesState: State) => void
  setRedBankState: (state: State) => void
  // ------------------
  // QUERY RELATED
  // ------------------
  previousRedBankQueryData?: RedBankData
  previousUserDebtQueryData?: UserDebtData
  previousUserDepositQueryData?: UserDepositData
  processRedBankQuery: (data: RedBankData, whitelistedAssets: Asset[]) => void
  processUserDebtQuery: (data: UserDebtData) => void
  processUserDepositQuery: (data: UserDepositData) => void
}
