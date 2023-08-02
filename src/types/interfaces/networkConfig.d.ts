interface NetworkConfig {
  name: import('@marsprotocol/wallet-connector').ChainInfoID
  displayName: string
  hiveUrl: string
  rpcUrl: string
  restUrl: string
  apolloAprUrl?: string
  usdPriceUrl?: string
  chainIcon: string
  contracts: {
    redBank: string
    incentives: string
    oracle: string
    accountNft?: string
    creditManager?: string
    pyth?: string
  }
  assets: {
    base: Asset
    whitelist: Asset[]
    other: OtherAsset[]
    currencies: (Asset | OtherAsset)[]
  }
  displayCurrency: displayCurrency
  appUrl: string
  isFieldsEnabled: boolean
  hasMultiAssetIncentives?: boolean
}

interface DisplayCurrency {
  denom: string
  prefix: string
  suffix: string
  decimals: number
}
