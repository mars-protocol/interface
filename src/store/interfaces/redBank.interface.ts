import { Coin } from '@cosmjs/stargate'
import { State } from 'types/enums'

export interface RedBankSlice {
  // ------------------
  // VARIABLES
  // ------------------
  marketAssetLiquidity: Coin[]
  marketInfo: Market[]
  redBankAssets: RedBankAsset[]
  redBankState: State
  showRedBankTutorial: boolean
  userBalancesState: State
  userCollateral?: UserCollateral[]
  userDebts?: Coin[]
  userDeposits?: Coin[]
  // ------------------
  // GENERAL FUNCTIONS
  // ------------------
  calculateIncentiveAssetsInfo: (
    incentive?: MarketIncentive | Record<string, any>,
    marketTotalLiquidity?: Coin,
  ) => IncentiveInfo[] | undefined
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
  processRedBankQuery: (data: RedBankData, whitelistedAssets: Asset[]) => void
}
