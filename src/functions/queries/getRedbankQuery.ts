import {
  getBalanceQuery,
  getBankQuery,
  getContractQuery,
  getIncentiveQuery,
  getMarketQuery,
  getUserCollateralQuery,
  getUserIncentivesQuery,
} from '.'

export const REDBANK_WASM_KEY = 'rbwasmkey'
export const USER_COLLATERAL_WASM_KEY = 'ucwasmkey'
export const getRedbankQuery = (
  address: string,
  redBankContractAddress: string,
  incentivesContractAddress: string,
  whitelistedAssets?: Asset[],
) => {
  const wasmQueries = whitelistedAssets?.map((asset: Asset) => {
    let query = ''
    const denom = asset.denom
    const symbol = asset.symbol
    const contract_addr = asset.contract_addr
    if (!denom) return query

    // Load cw 20 balance
    if (contract_addr) {
      query = getContractQuery(symbol, contract_addr, getBalanceQuery(redBankContractAddress || ''))
    }

    // Load market info
    const marketQuery = getMarketQuery(denom)

    const marketKey = `${symbol}Market`
    query = query + getContractQuery(marketKey, redBankContractAddress || '', marketQuery)

    const incentiveKey = `${symbol}MarketIncentive`
    query =
      query +
      getContractQuery(
        incentiveKey,
        incentivesContractAddress || '',
        getIncentiveQuery(asset.denom || ''),
      )
    return query
  })

  return `query RedbankQuery {
                ${getBankQuery(redBankContractAddress)}
                ${REDBANK_WASM_KEY}: wasm {
                    ${wasmQueries}
                    ${
                      address &&
                      getContractQuery(
                        'collateral',
                        redBankContractAddress || '',
                        getUserCollateralQuery(address),
                      )
                    }
                    ${
                      address &&
                      getContractQuery(
                        'unclaimedRewards',
                        incentivesContractAddress || '',
                        getUserIncentivesQuery(address),
                      )
                    }
                }
        }`
}
