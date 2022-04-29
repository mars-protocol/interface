type NetworkConfig = ExtNetworkConfig & LocalNetworkConfig

interface Network extends NetworkConfig {
    /** Get finder link */
    finder: (address: string, path?: string) => string
    /* JSON object containing all the protocols contract addresses */
    networkAddresses?: NetworkAddresses
    /* JSON object containing oracle contract addresses */
    oracleAddresses?: OracleAddresses
    /* JSON object containing basecamp contract addresses */
    basecampAddresses?: BasecampAddresses
    /* Contains asset info for all the whitelisted assets on the selected network */
    whitelistedAssets?: WhitelistAsset[]
    /* Contains asset info for assets that are not supported by red bank but still need a price source  */
    otherAssets?: OtherAsset[]
    /* Contains asset info for all active strategies on the selected network */
    fieldsStrategies?: FieldsStrategy[]
    /* Contains contract address info for the lock drop app */
    lockdropAddresses?: LockdropAddresses
    /* network error state */
    setNetworkErrorState: (state: boolean) => void
    networkError: boolean
    /* Has network finished initialisation. */
    localNetwork: LocalNetworkConfig
    isNetworkSupported?: boolean
    setIsNetworkSupported: (state: boolean) => void
    loaded: boolean
}

interface ExtNetworkConfig {
    name: string
    chainID: string
    /* Light Client Daeon connected wallet is using */
    lcd: string
    fcd: string
    mantle: string
}

interface GasPrices {
    uusd: string
}

interface Fee {
    gas: number
    gasPrice: number
    amount: number
}

interface LocalNetworkConfig extends ExtNetworkConfig {
    name: string
    gasPriceURL: string
    airdropWebServiceURL: string
    privateLcd: string
}

interface NetworkAddresses {
    contracts: MoneyMarketContracts
    whitelist: MaTokenContracts
}

interface MoneyMarketContracts {
    redBankContractAddress: string
}

interface MaTokenContracts {
    [address: string]: MaTokenDenom
}

interface MaTokenDenom {
    denom: string
}

interface OracleAddresses {
    contracts: OracleContracts
}

interface OracleContracts {
    astroportFactoryAddress: string
}

interface BasecampAddresses {
    contracts: BasecampContracts
}

interface BasecampContracts {
    basecampAddress: string
}

interface LockdropAddresses {
    airdropAddress: string
    lockdropAddress: string
    auctionAddress: string
    astroportMarsUstPoolAddress: string
}

interface WhitelistAsset {
    symbol: string
    name: string
    logo: string
    denom: string
    contract_addr?: string
    maToken: string
    color: string
    native: boolean
    decimals: number
    hasOraclePrice: boolean
}

type OtherAsset = WhitelistAsset

type AllAsset = WhitelistAsset

interface StdFee {
    gas: number
    gasPrice: number
    amount: number
}
