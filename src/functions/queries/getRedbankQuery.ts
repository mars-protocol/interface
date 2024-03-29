import {
  getBalanceQuery,
  getContractQuery,
  getIncentiveQuery,
  getMarketQuery,
  getUserIncentivesQuery,
} from '.'

export const REDBANK_WASM_KEY = 'rbwasmkey'
export const USER_COLLATERAL_WASM_KEY = 'ucwasmkey'
export const getRedbankQuery = (
  address: string,
  redBankContractAddress: string,
  incentivesContractAddress: string,
  hasMultiAssetIncentives: boolean,
  whitelistedAssets?: Asset[],
) => {
  const wasmQueries = whitelistedAssets?.map((asset: Asset) => {
    let query = ''
    const denom = asset.denom
    const id = asset.id
    const contract_addr = asset.contract_addr
    if (!denom) return query

    // Load cw 20 balance
    if (contract_addr) {
      query = getContractQuery(id, contract_addr, getBalanceQuery(redBankContractAddress || ''))
    }

    // Load market info
    const marketQuery = getMarketQuery(denom)

    const marketKey = `${id}Market`
    query = query + getContractQuery(marketKey, redBankContractAddress || '', marketQuery)

    const incentiveKey = `${id}MarketIncentive`
    query =
      query +
      getContractQuery(
        incentiveKey,
        incentivesContractAddress || '',
        getIncentiveQuery(asset.denom || '', hasMultiAssetIncentives),
      )
    return query
  })

  return `query RedbankQuery {
                ${REDBANK_WASM_KEY}: wasm {
                    ${wasmQueries}
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
