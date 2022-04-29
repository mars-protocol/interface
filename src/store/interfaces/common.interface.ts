import { WalletStatus } from '@terra-money/wallet-provider'
import { InitDataWrapper } from '../../queries-new/BlockHeightQuery'

export interface CommonSlice {
    userWalletAddress: string
    basecampAddresses?: BasecampAddresses
    isNetworkSupported?: boolean
    isNetworkLoaded: boolean
    isRewardCenterOpen: boolean
    fieldsStrategies?: FieldsStrategy[]
    latestBlockHeight: number
    lockdropAddresses?: LockdropAddresses
    networkAddresses?: NetworkAddresses
    networkConfig?: LocalNetworkConfig
    oracleAddresses?: OracleAddresses
    otherAssets?: OtherAsset[]
    whitelistedAssets?: WhitelistAsset[]
    getFinderUrl: (address: string, path: string) => string
    getTax: (amount: string) => string
    processInitQuery: (data: InitDataWrapper) => void
    setIsNetworkSupported: (value: boolean) => void
    setIsRewardCenterOpen: (value: boolean) => void
    setNetworkAddresses: (address: NetworkAddresses) => void
    setNetworkConfig: (network: LocalNetworkConfig) => void
    setNetworkInfo: (networkName: string, status: WalletStatus) => void
    setUserWalletAddress: (address: string) => void
}
