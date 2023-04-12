interface NetworkConfig {
  name: import('@marsprotocol/wallet-connector').ChainInfoID
  hiveUrl: string
  rpcUrl: string
  restUrl: string
  apolloAprUrl: string
  osmoUsdPriceUrl: string
  contracts: {
    redBank: string
    incentives: string
    oracle: string
    accountNft: string
    creditManager: string
  }
  assets: {
    base: Asset
    whitelist: Asset[]
    other: OtherAsset[]
    currencies: (Asset | OtherAsset)[]
  }
  displayCurrency: displayCurrency
  appUrl: string
  wallets: import('@marsprotocol/wallet-connector').WalletID[]
}

interface DisplayCurrency {
  denom: string
  prefix: string
  suffix: string
  decimals: number
}
