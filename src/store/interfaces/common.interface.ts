import { LcdClient } from '@cosmjs/launchpad'
import { Coin, StdFee } from '@cosmjs/stargate'
import { BroadcastResult } from '@delphi-labs/shuttle-react'
import { BlockHeightData } from 'hooks/queries/useBlockHeight'
import { DepositAndDebtData } from 'hooks/queries/useDepositAndDebt'
import { UserBalanceData } from 'hooks/queries/useUserBalance'
import { UserIcnsData } from 'hooks/queries/useUserIcns'
import { ChainInfoID, WalletID } from 'types/enums/wallet'
import { MarsParamsQueryClient } from 'types/generated/mars-params/MarsParams.client'
import { AssetParamsBaseForAddr } from 'types/generated/mars-params/MarsParams.types'
import { ContractMsg } from 'types/types'

export interface CommonSlice {
  // ------------------
  // VARIABLES
  // ------------------
  addressProviderConfig?: AddressProviderConfig
  assetParams: AssetParamsBaseForAddr[]
  baseAsset?: Asset
  basecampConfig?: BasecampConfig
  baseCurrency: {
    denom: string
    symbol: string
    decimals: number
  }
  chainInfo?: ChainInfo
  client?: WalletClient
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
  paramsClient?: MarsParamsQueryClient
  queryErrors: string[]
  acceptedTermsOfService: boolean
  slippage: number
  tutorialSteps: { redbank: number; fields: number }
  userBalances: Coin[]
  userUnclaimedRewards: Coin[]
  userMarsTokenBalances: Coin[]
  userWalletAddress: string
  showWalletSelect: boolean
  userIcns?: string
  vaultConfigs: Vault[]
  walletConnecting?: { show: boolean; providerId: WalletID }
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
  }) => Promise<BroadcastResult | undefined>
  loadNetworkConfig: () => void
  queryContract: <T>(
    contractAddress: string,
    queryMsg: object,
    retries?: number,
    ignoreFailures?: boolean,
  ) => Promise<T | undefined>
  // ------------------
  setChainInfo: (chainInfo: ChainInfo) => void
  // ------------------
  // SETTERS
  setCurrentNetwork: (network: ChainInfoID) => void
  setTutorialStep: (type: 'fields' | 'redbank', step?: number) => void
  setLcdClient: (rpc: string, chainId: string) => void
  setNetworkError: (isError: boolean) => void
  setQueryError: (name: string, isError: boolean) => void
  setServerError: (isError: boolean) => void
  // ------------------
  previousBlockHeightQueryData?: BlockHeightData
  // ------------------
  // QUERY RELATED
  previousUserBalanceQueryData?: UserBalanceData
  previousUserIcnsQueryData?: UserIcnsData
  previousUserUnclaimedBalanceQueryData?: number
  processDepositAndDebtQuery: (data: DepositAndDebtData) => void
  processUserBalanceQuery: (data: UserBalanceData) => void
  processBlockHeightQuery: (data: BlockHeightData) => void

  getAdditionalDecimals(denom: string): number
}
