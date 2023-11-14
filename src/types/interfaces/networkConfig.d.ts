interface NetworkConfig {
  name: ChainInfoID
  displayName: string
  hiveUrl: string
  rpcUrl: string
  restUrl: string
  vaultAprUrl?: string
  usdPriceUrl?: string
  chainIcon: string
  contracts: {
    redBank: string
    incentives: string
    oracle: string
    accountNft?: string
    creditManager?: string
    pyth?: string
    params?: string
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
