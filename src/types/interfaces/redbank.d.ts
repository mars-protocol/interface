interface RedBankData {
  balance?: {
    balance: import('@cosmjs/stargate').Coin[]
  }
  rbwasmkey: {
    OSMOMarket: Market
    OSMOMarketIncentive: MarketIncentive
    ATOMMarket: Market
    ATOMMarketIncentive: MarketIncentive
    AXLMarket: Market
    AXLMarketIncentive: MarketIncentive
    JUNOMarket: Market
    JUNOMarketIncentive: MarketIncentive
    axlUSDCMarket: Market
    axlUSDCMarketIncentive: MarketIncentive
    axlWBTCMarket: Market
    axlWBTCMarketIncentive: MarketIncentive
    axlWETHMarket: Market
    axlWETHMarketIncentive: MarketIncentive
    stATOMMarket: Market
    stATOMMarketIncentive: MarketIncentive
    nUSDCMarket: Market
    nUSDCMarketIncentive: MarketIncentive
    collateral: UserCollateral[]
    unclaimedRewards: string
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
  index: string
  last_updated: number
  start_time: number
  duration: number
}
