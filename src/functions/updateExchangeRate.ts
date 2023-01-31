import { Coin } from '@cosmjs/proto-signing'

export const updateExchangeRate = (coin: Coin, exchangeRates: Coin[]) => {
  const assetIndex = exchangeRates.findIndex((xAsset) => xAsset.denom === coin.denom)
  if (assetIndex > -1) {
    exchangeRates[assetIndex] = coin
  } else {
    exchangeRates.push(coin)
  }
  return exchangeRates
}
