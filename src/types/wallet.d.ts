type WalletInfos = Record<WalletID, WalletInfo>

interface WalletInfo {
  name: string
  install?: string
  installURL?: string
  description: string
  imageURL: string
  mobileImageURL?: string
  supportedChains: ChainInfoID[]
  walletConnect?: string
}

type ChainInfos = Record<ChainInfoID, ChainInfo>
type Network = import('@delphi-labs/shuttle-react').Network

interface ChainInfo extends Network {
  explorer: string
  explorerName: string
}

interface WalletClient {
  sign: (options: {
    messages: import('@delphi-labs/shuttle-react').TransactionMsg<any>[]
    feeAmount?: string | null | undefined
    gasLimit?: string | null | undefined
    memo?: string | null | undefined
    wallet?: import('@delphi-labs/shuttle-react').WalletConnection | null | undefined
  }) => Promise<import('@delphi-labs/shuttle-react').SigningResult>
  cosmWasmClient: import('@cosmjs/cosmwasm-stargate').CosmWasmClient
  connectedWallet: import('@delphi-labs/shuttle-react').WalletConnection
  broadcast: (options: {
    messages: import('@delphi-labs/shuttle-react').TransactionMsg<any>[]
    feeAmount?: string | null | undefined
    gasLimit?: string | null | undefined
    memo?: string | null | undefined
    wallet?: import('@delphi-labs/shuttle-react').WalletConnection | null | undefined
  }) => Promise<import('@delphi-labs/shuttle-react').BroadcastResult>
  simulate: (options: {
    messages: import('@delphi-labs/shuttle-react').TransactionMsg<any>[]
    wallet?: import('@delphi-labs/shuttle-react').WalletConnection | null | undefined
  }) => Promise<import('@delphi-labs/shuttle-react').SimulateResult>
}
