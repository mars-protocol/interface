interface RedBankData {
  balance?: {
    balance: import('@cosmjs/stargate').Coin[]
  }
  rbwasmkey: {
    OSMOMarket: Market
    OSMOMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    AKTMarket: Market
    AKTMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    ATOMMarket: Market
    ATOMMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    AXLMarket: Market
    AXLMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    DYDXMarket: Market
    DYDXMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    INJMarket: Market
    INJMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    ASTROMarket: Market
    ASTROMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    axlUSDCMarket: Market
    axlUSDCMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    axlWBTCMarket: Market
    axlWBTCMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    axlWETHMarket: Market
    axlWETHMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    stATOMMarket: Market
    stATOMMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    USDCMarket: Market
    USDCMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    USDTMarket: Market
    USDTMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    NTRNMarket: Market
    NTRNMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    TIAMarket: Market
    TIAMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    stOSMOMarket: Market
    stOSMOMarketIncentive: MarketIncentive | MultiAssetMarketIncentive[]
    collateral: UserCollateral[]
    unclaimedRewards: string | Coin[]
  }
}

interface Market {
  denom: string
  max_loan_to_value: string
  liquidation_threshold: string
  liquidation_bonus: string
  reserve_factor: string
  interest_rate_model: InterestRateModel
  borrow_index: string
  liquidity_index: string
  borrow_rate: string
  liquidity_rate: string
  indexes_last_updated: number
  collateral_total_scaled: string
  debt_total_scaled: string
  deposit_enabled: boolean
  borrow_enabled: boolean
  deposit_cap: string
  incentives: MarketIncentive[]
}

interface InterestRateModel {
  optimal_utilization_rate: string
  base: string
  slope_1: string
  slope_2: string
}

interface MarketIncentive {
  denom: string
  emission_per_second: string
  index?: string
  last_updated?: number
  start_time?: number
  duration?: number
}

interface MultiAssetMarketIncentive {
  denom: string
  emission_rate: number
}
