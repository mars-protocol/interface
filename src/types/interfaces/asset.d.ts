interface Asset {
  color: string
  name: string
  denom: string
  symbol:
    | 'OSMO'
    | 'NTRN'
    | 'ATOM'
    | 'ASTRO'
    | 'AXL'
    | 'JUNO'
    | 'USDC.axl'
    | 'USDC'
    | 'stATOM'
    | 'WBTC.axl'
    | 'WETH.axl'
  id:
    | 'OSMO'
    | 'NTRN'
    | 'axlUSDC'
    | 'USDC'
    | 'axlWBTC'
    | 'axlWETH'
    | 'ATOM'
    | 'ASTRO'
    | 'AXL'
    | 'JUNO'
    | 'stATOM'
  prefix?: string
  contract_addr?: string
  logo: string
  decimals: number
  poolBase?: string
  priceFeedId?: string
}

interface OtherAsset extends Omit<Asset, 'symbol'> {
  symbol: string
  id?: string
}

interface AssetPairInfo {
  denom: string
  contract_addr: string
}

type NetworkAssets = { [denom: string]: Asset }

interface RedBankAsset extends Asset {
  borrowRate: number
  apy: number
  walletBalance: string
  borrowBalance: string
  borrowBalanceBaseCurrency: number
  borrowRate: number
  depositBalance: string
  depositBalanceBaseCurrency: number
  marketLiquidity: string
  isCollateral: boolean
  incentiveInfo?: IncentiveInfo[]
  depositCap: number
  depositLiquidity: numnber
  borrowEnabled: boolean
  depositEnabled: boolean
  // This is a hack, subRows can only contain same data model
  subRows?: DepositAsset[]
}

interface IncentiveInfo {
  color: string
  symbol: string
  apy: number
}
