interface NetworkConfig {
  name: string
  hiveUrl: string
  rpcUrl: string
  restUrl: string
  apolloAprUrl: string
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
  }
  displayCurrency: {
    denom: string
    prefix: string
    suffix: string
    decimals: number
  }
  appUrl: string
  wallets: import('@marsprotocol/wallet-connector').WalletID[]
}
