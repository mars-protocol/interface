import { Coin } from '@cosmjs/proto-signing'

export const updateAssetPrices = (coin: Coin, assetPricesUSD: Coin[], override?: boolean) => {
  const assetIndex = assetPricesUSD.findIndex((asset) => asset.denom === coin.denom)
  if (assetIndex > -1) {
    if (Number(coin.amount) > 0 && override) assetPricesUSD[assetIndex] = coin
  } else {
    if (Number(coin.amount) > 0) assetPricesUSD.push(coin)
  }

  return assetPricesUSD
}
