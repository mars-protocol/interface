interface MarsPriceData {
  prices: {
    mars: {
      rate: string
    }
  }
}

interface PoolResponse {
  pool: PoolData
}

interface PoolData {
  address: string
  id: string
  total_shares: {
    denom: string
    amount: string
  }
  pool_assets: PoolAsset[]
  total_weight: string
}

interface PoolAsset {
  token: {
    denom: string
    amount: string
  }
  weight: string
}
