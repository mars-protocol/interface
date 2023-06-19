interface OracleData {
  oracle: {
    config: {
      owner: string
      proposed_new_owner: string
      base_denom: string
    }
  }
  sources: {
    price_sources: PriceSource[]
  }
  prices: {
    [key: string]: {
      denom: string
      price: string
    }
  }
}

interface PriceSource {
  denom: string
  price_source:
    | FixedPriceSource
    | XykPriceSource
    | PythPriceSource
    | TwapPriceSource
    | LsdPriceSource
}

interface FixedPriceSource {
  fixed: {
    price: string
  }
}

interface XykPriceSource {
  xyk_liquidity_token: {
    pool_id: number
  }
}

interface PythPriceSource {
  pyth: {
    contract_addr: string
    price_feed_id: string
    max_staleness: number
  }
}

interface TwapPriceSource {
  geometric_twap: {
    pool_id: number
    window_size: number
    downtime_detector: {
      downtime: string
      recovery: number
    }
  }
}

interface LsdPriceSource {
  lsd: {
    transitive_denom: string
    geometric_twap: {
      pool_id: number
      window_size: number
      downtime_detector: {
        downtime: string
        recovery: number
      }
    }
    redemption_rate: {
      contract_addr: string
      max_staleness: number
    }
  }
}

interface VaaInformation {
  priceFeeds: string[]
  data: string[]
}
