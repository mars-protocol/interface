interface Asset {
  color: string
  name: string
  denom: string
  symbol:
    | 'OSMO'
    | 'NTRN'
    | 'AKT'
    | 'ATOM'
    | 'ASTRO'
    | 'AXL'
    | 'DYDX'
    | 'INJ'
    | 'USDC.axl'
    | 'USDC'
    | 'USDT'
    | 'stATOM'
    | 'WBTC.axl'
    | 'WETH.axl'
    | 'TIA'
    | 'stOSMO'
    | 'wstETH'
    | 'stkATOM'
  id:
    | 'OSMO'
    | 'NTRN'
    | 'AKT'
    | 'axlUSDC'
    | 'DYDX'
    | 'USDC'
    | 'USDT'
    | 'axlWBTC'
    | 'axlWETH'
    | 'ATOM'
    | 'ASTRO'
    | 'AXL'
    | 'INJ'
    | 'stATOM'
    | 'TIA'
    | 'stOSMO'
    | 'wstETH'
    | 'stkATOM'
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
  depositCap: { amount: string; used: string }
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
