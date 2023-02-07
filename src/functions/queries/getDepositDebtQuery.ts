import { getContractQuery } from './getContractQuery'

export const getDepositDebtQuery = (
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

    const depositMarketKey = `${symbol}Deposits`
    query =
      query +
      getContractQuery(
        depositMarketKey,
        redBankAddress || '',
        `
        {
          underlying_liquidity_amount: {
            denom: "${denom}"
            amount_scaled: "${totalCollateralScaled}"
          }
        }`,
      )

    const totalDebtScaled =
      marketInfo.find((market) => market.denom === asset.denom)?.debt_total_scaled || '0'
    const debtMarketKey = `${symbol}Debt`
    query =
      query +
      getContractQuery(
        debtMarketKey,
        redBankAddress || '',
        `
        {
            underlying_debt_amount: {
                denom: "${denom}"
                amount_scaled: "${totalDebtScaled}"
            }
        }`,
      )

    return query
  })

  return `query DepositDebtQuery {
        mdwasmkey: wasm {
            ${wasmQueries}
        }
     }
     
     `
}
