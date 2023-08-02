import { LcdClient } from '@cosmjs/launchpad'
import { Coin, StdFee } from '@cosmjs/stargate'
import {
  ChainInfoID,
  SimplifiedChainInfo,
  TxBroadcastResult,
  WalletClient,
} from '@marsprotocol/wallet-connector'
import { BlockHeightData } from 'hooks/queries/useBlockHeight'
import { DepositAndDebtData } from 'hooks/queries/useDepositAndDebt'
import { UserBalanceData } from 'hooks/queries/useUserBalance'
import { UserIcnsData } from 'hooks/queries/useUserIcns'
import { ContractMsg } from 'types/types'

export interface CommonSlice {
  // ------------------
  // VARIABLES
  // ------------------
  addressProviderConfig?: AddressProviderConfig
  baseAsset?: Asset
  basecampConfig?: BasecampConfig
  baseCurrency: {
    denom: string
    symbol: string
    decimals: number
  }
  chainInfo?: SimplifiedChainInfo
  client?: WalletClient
  currencyAssets: (Asset | OtherAsset)[]
  currentNetwork: ChainInfoID
  marketDebts: Coin[]
  enableAnimations?: boolean
  errors: {
    network: boolean
    query: boolean
    server: boolean
  }
  latestBlockHeight: number
  lcdClient?: LcdClient
  isLedger: boolean
  marketDeposits: Coin[]
  networkConfig: NetworkConfig
  otherAssets: OtherAsset[]
  queryErrors: string[]
  acceptedTermsOfService: boolean
  slippage: number
  tutorialSteps: { redbank: number; fields: number }
  userBalances: Coin[]
  userUnclaimedRewards: Coin[]
  userMarsTokenBalances: Coin[]
  userWalletAddress: string
  userIcns?: string
  vaultConfigs: Vault[]
  whitelistedAssets: Asset[]
  // ------------------
  // GENERAL FUNCTIONS
  // ------------------
  convertToBaseCurrency: (coin: Coin) => number
  convertValueToAmount: (coin: Coin) => number
  executeMsg: (options: {
    msg: ContractMsg
    funds?: Coin[]
    contract: string
    fee: StdFee
    sender?: string
  }) => Promise<TxBroadcastResult | undefined>
  getAdditionalDecimals(denom: string): number
  loadNetworkConfig: () => void
  queryContract: <T>(
    contractAddress: string,
    queryMsg: object,
    retries?: number,
    ignoreFailures?: boolean,
  ) => Promise<T | undefined>
  // ------------------
  // SETTERS
  // ------------------
  setChainInfo: (chainInfo: SimplifiedChainInfo) => void
  setCurrentNetwork: (network: ChainInfoID) => void
  setTutorialStep: (type: 'fields' | 'redbank', step?: number) => void
  setLcdClient: (rpc: string, chainId: string) => void
  setNetworkError: (isError: boolean) => void
  setQueryError: (name: string, isError: boolean) => void
  setServerError: (isError: boolean) => void
  // ------------------
  // QUERY RELATED
  // ------------------
  previousBlockHeightQueryData?: BlockHeightData
  previousUserBalanceQueryData?: UserBalanceData
  previousUserIcnsQueryData?: UserIcnsData
  previousUserUnclaimedBalanceQueryData?: number
  processDepositAndDebtQuery: (data: DepositAndDebtData) => void
  processUserBalanceQuery: (data: UserBalanceData) => void
  processBlockHeightQuery: (data: BlockHeightData) => void
}
