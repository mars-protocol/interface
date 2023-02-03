import { LcdClient } from '@cosmjs/launchpad'
import { Coin, StdFee } from '@cosmjs/stargate'
import {
  SimplifiedChainInfo,
  TxBroadcastResult,
  WalletClient,
} from '@marsprotocol/wallet-connector'
import { BlockHeightData } from 'hooks/queries/useBlockHeight'
import { MarketDepositsData } from 'hooks/queries/useMarketDeposits'
import { SafetyFundBalanceData } from 'hooks/queries/useSafetyFundBalance'
import { UserBalanceData } from 'hooks/queries/useUserBalance'
import { UserIcnsData } from 'hooks/queries/useUserIcns'
import { Network } from 'types/enums/network'
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
  baseToDisplayCurrencyRatio?: number
  chainInfo?: SimplifiedChainInfo
  client?: WalletClient
  currentNetwork: Network
  displayCurrency: {
    denom: string
    prefix: string
    suffix: string
    decimals: number
  }
  enableAnimations?: boolean
  errors: {
    network: boolean
    query: boolean
    server: boolean
  }
  isNetworkLoaded: boolean
  latestBlockHeight: number
  lcdClient?: LcdClient
  marketDeposits: Coin[]
  networkConfig?: NetworkConfig
  otherAssets: Asset[]
  queryErrors: string[]
  slippage: number
  safetyFundBalance?: Coin
  tutorialSteps: { redbank: number; fields: number }
  userBalances: Coin[]
  userUnclaimedRewards: string
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
  setCurrentNetwork: (network: Network) => void
  setTutorialStep: (type: 'fields' | 'redbank', step?: number) => void
  setLcdClient: (rpc: string, chainID: string) => void
  setNetworkError: (isError: boolean) => void
  setClient: (client: WalletClient) => void
  setQueryError: (name: string, isError: boolean) => void
  setServerError: (isError: boolean) => void
  setUserIcns: (icns: string) => void
  setUserWalletAddress: (address: string) => void
  // ------------------
  // QUERY RELATED
  // ------------------
  previousBlockHeightQueryData?: BlockHeightData
  previousSafetyFundBalanceQueryData?: SafetyFundBalanceData
  previousUserBalanceQueryData?: UserBalanceData
  previousUserIcnsQueryData?: UserIcnsData
  previousUserUnclaimedBalanceQueryData?: number
  processMarketDepositsQuery: (data: MarketDepositsData) => void
  processUserBalanceQuery: (data: UserBalanceData) => void
  processBlockHeightQuery: (data: BlockHeightData) => void
  processSafetyFundQuery: (data: SafetyFundBalanceData) => void
}
