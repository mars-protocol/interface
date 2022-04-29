import { useEffect, useState } from 'react'
import { Coin } from '@terra-money/terra.js'

import createContext from './createContext'
import { gql, useQuery } from '@apollo/client'
import { State } from '../types/enums'
import useStore from '../store'

export interface MarsOracle {
    state: State
    uusdExchangeRates: Coin[] | undefined
    refetch: () => void
}

export const [useMarsOracle, MarsOracleProvider] =
    createContext<MarsOracle>('useMarsOracle')

export const useMarsOracleState = (
    oracleAddress: string | undefined
): MarsOracle => {
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const otherAssets = useStore((s) => s.otherAssets)

    const [uusdExchangeRates, setuusdExchangeRates] = useState<Coin[]>()
    const [state, setState] = useState(State.INITIALISING)

    const produceWasmQuery = (oracleAddress: string, wasmKey: string) => {
        let queries = ``
        if (!whitelistedAssets || !otherAssets || !oracleAddress || !wasmKey)
            return 'error'
        const allAssets = [
            ...whitelistedAssets,
            ...otherAssets.filter((asset) => asset.hasOraclePrice),
        ]
        allAssets
            .filter((asset: WhitelistAsset) => !!asset.denom)
            .forEach((whitelistAsset) => {
                const denom = whitelistAsset.denom
                const contract_addr = whitelistAsset.contract_addr

                const asset = contract_addr
                    ? `{
                    asset: {
                        cw20: {
                            contract_addr: "${contract_addr}"
                        }
                    }
                }`
                    : `{
                    asset: {
                        native: {
                            denom: "${denom}"
                        }
                    }
                }`

                let querySegment = `
                    ${denom}: contractQuery(contractAddress: "${oracleAddress}", query: {
                        asset_price: ${asset}
                    })
                `
                queries = queries + querySegment
            })
        return `${wasmKey}: wasm {
                    ${queries}
                }`
    }

    const wasmKey = 'marsOracleWasmQuery'
    const wasmQuery = produceWasmQuery(oracleAddress || '', wasmKey)

    const query = gql`query UseMarsOracleQuery{
                        ${wasmQuery}
                    }`

    const { loading, data, error, refetch } = useQuery(query, {
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true,
        pollInterval: 60000,
        skip: !whitelistedAssets || !oracleAddress,
    })

    useEffect(() => {
        const initialise = () => {
            if (error && state !== State.ERROR && !data) {
                setState(State.ERROR)
            }
        }
        initialise()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    useEffect(() => {
        const initialise = () => {
            if (data && !loading && !error) {
                const wasmQueryResults = data[wasmKey]
                const exchangeRates: Coin[] = []

                whitelistedAssets
                    ?.filter((asset: WhitelistAsset) => !!asset.denom)
                    .forEach((asset: WhitelistAsset) => {
                        const denom = asset.denom
                        const exchangeRate: number =
                            wasmQueryResults[`${denom}`]
                        exchangeRates.push(new Coin(denom, exchangeRate))
                    })
                setuusdExchangeRates(exchangeRates)
                setState(State.READY)
            }
        }
        initialise()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    return { state, uusdExchangeRates, refetch }
}
