interface Asset {
  color: string
  name: string
  denom: string
  symbol:
    | 'OSMO'
    | 'ATOM'
    | 'AXL'
    | 'JUNO'
    | 'USDC.axl'
    | 'USDC.n'
    | 'stATOM'
    | 'WBTC.axl'
    | 'WETH.axl'
  id: 'axlUSDC' | 'nUSDC' | 'axlWBTC' | 'axlWETH' | 'OSMO' | 'ATOM' | 'AXL' | 'JUNO' | 'stATOM'
  prefix?: string
  contract_addr?: string
  logo: string
  decimals: number
  poolId?: number
  poolBase?: string
}

interface OtherAsset extends Omit<Asset, 'symbol'> {
  symbol: 'MARS' | ''
  id?: ''
}

interface AssetPairInfo {
  denom: string
  contract_addr: string
}

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
  incentiveInfo?: IncentiveInfo
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
