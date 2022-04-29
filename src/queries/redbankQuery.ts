import { getMaTokenAddress } from '../libs/assetInfo'
import {
    balanceQuery,
    bankQuery,
    contractQuery,
    incentiveQuery,
    cw20MarketQuery,
    nativeMarketQuery,
    infoQuery,
    userCollateralQuery,
} from './'

export const REDBANK_WASM_KEY = 'rbwasmkey'
export const USER_COLLATERAL_WASM_KEY = 'ucwasmkey'
export const redbankQuery = (
    address: string,
    redBankContractAddress: string,
    incentivesContractAddress: string,
    whitelistedAssets?: WhitelistAsset[],
    networkAddresses?: NetworkAddresses
) => {
    const wasmQueries = whitelistedAssets?.map((asset: WhitelistAsset) => {
        let query = ''
        const denom = asset.denom
        const contract_addr = asset.contract_addr
        if (!denom) return query

        // Load cw 20 balance
        if (contract_addr) {
            query = contractQuery(
                denom,
                contract_addr,
                balanceQuery(redBankContractAddress || '')
            )
        }

        // Load market info
        const marketQuery = contract_addr
            ? cw20MarketQuery(contract_addr)
            : nativeMarketQuery(denom)

        const marketKey = `${denom}Market`
        query =
            query +
            contractQuery(marketKey, redBankContractAddress || '', marketQuery)

        const maTokenAddress = getMaTokenAddress(
            networkAddresses?.whitelist,
            denom
        )
        const incentiveKey = `${denom}MarketIncentive`
        query =
            query +
            contractQuery(
                incentiveKey,
                incentivesContractAddress || '',
                incentiveQuery(maTokenAddress)
            )

        const maTokenInfoKey = `${denom}MarketMaToken`
        query =
            query + contractQuery(maTokenInfoKey, maTokenAddress, infoQuery())

        return query
    })

    return `query RedbankQuery {
                ${bankQuery(redBankContractAddress)}
                ${REDBANK_WASM_KEY}: wasm {
                    ${wasmQueries}
                    ${
                        address &&
                        contractQuery(
                            USER_COLLATERAL_WASM_KEY,
                            redBankContractAddress || '',
                            userCollateralQuery(address)
                        )
                    }
                }
        }`
}
