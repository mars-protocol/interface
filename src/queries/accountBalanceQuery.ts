import { getMaTokenAddress } from '../libs/assetInfo'
import { balanceQuery } from './balanceQuery'
import { bankQuery } from './bankQuery'
import { contractQuery } from './contractQuery'
import { debtQuery } from './debtQuery'

export const accountBalanceQuery = (
    address: string,
    wasmKey: string,
    allAssets: AllAsset[],
    networkAddresses?: NetworkAddresses
) => {
    const queries = allAssets?.map((asset: AllAsset) => {
        let query = ``
        const contractAddress = asset.contract_addr
        const denom = asset.denom
        const maTokenAddress = getMaTokenAddress(
            networkAddresses?.whitelist,
            denom
        )
        // Only whitelisted assets have maTokens, only get deposits and debts for whitelisted tokens,
        // but we are getting balances for all assets here (whitelist + other)
        if (maTokenAddress) {
            query += contractQuery(
                `${denom}Deposit`,
                maTokenAddress,
                balanceQuery(address)
            )
            query += contractQuery(
                'debts',
                networkAddresses?.contracts.redBankContractAddress || '',
                debtQuery(address)
            )
        }
        if (contractAddress)
            query += contractQuery(
                denom,
                contractAddress,
                balanceQuery(address)
            )
        return query
    })

    const wasmQuery =
        queries.length > 0
            ? `${wasmKey}: wasm {
        ${queries}
    }`
            : ``

    return `{
        ${bankQuery(address)}
        ${wasmQuery}
    }`
}
