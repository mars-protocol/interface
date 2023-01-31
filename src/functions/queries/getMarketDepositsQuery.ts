import { getContractQuery } from './getContractQuery'

export const getMarketDepositsQuery = (
  redBankAddress: string,
  whitelistedAssets: Asset[],
  marketInfo: Market[],
) => {
  const wasmQueries = whitelistedAssets?.map((asset: Asset) => {
    let query = ''
    const denom = asset.denom
    const symbol = asset.symbol

    if (!denom) return query

    const totalCollateralScaled =
      marketInfo.find((market) => market.denom === asset.denom)?.collateral_total_scaled || '0'

    const marketKey = `${symbol}Deposits`
    query =
      query +
      getContractQuery(
        marketKey,
        redBankAddress || '',
        `
        {
            underlying_liquidity_amount: {
                denom: "${denom}"
                amount_scaled: "${totalCollateralScaled}"
            }
        }`,
      )
    return query
  })

  return `query MarketDepositsQuery {
        mdwasmkey: wasm {
            ${wasmQueries}
        }
     }
     
     `
}
