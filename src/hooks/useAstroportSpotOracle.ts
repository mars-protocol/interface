import { useEffect, useState } from 'react'
import { Coin } from '@terra-money/terra.js'

import createContext from './createContext'
import { gql, useQuery } from '@apollo/client'
import { State } from '../types/enums'
import useStore from '../store'

export interface AstroportSpotOracle {
    state: State
    uusdExchangeRates: Coin[] | undefined
    refetch: () => void
}

interface AssetPairInfo {
    denom: string
    contract_addr: string
}

interface PairQueryResponse {
    contract_addr: string
}

interface Token {
    contract_addr: string
}

interface NativeToken {
    denom: string
}

interface AssetInfo {
    token?: Token
    native_token?: NativeToken
}

interface Asset {
    info: AssetInfo
    amount: number
}

interface PoolQueryResponse {
    assets: Asset[]
    total_share: number
}

export const [useAstroportSpotOracle, AstroportSpotOracleProvider] =
    createContext<AstroportSpotOracle>('useAstroportSpotOracle')

export const useAstroportSpotOracleState = (): AstroportSpotOracle => {
    const otherAssets = useStore((s) => s.otherAssets)
    const oracleAddresses = useStore((s) => s.oracleAddresses)
    const [assetPairInfos, setAssetPairInfos] = useState<AssetPairInfo[]>()
    const [uusdExchangeRates, setuusdExchangeRates] = useState<Coin[]>()
    const [state, setState] = useState(State.INITIALISING)

    const produceWasmPairQuery = (
        astroportFactoryAddress: string,
        wasmPairKey: string
    ) => {
        let queries = ``
        if (!otherAssets || !astroportFactoryAddress || !wasmPairKey)
            return 'error'

        otherAssets
            .filter((otherAsset: OtherAsset) => !!otherAsset.contract_addr)
            .forEach((otherAsset: OtherAsset) => {
                const denom = otherAsset.denom
                const contract_addr = otherAsset.contract_addr

                const pairQuery = `{
                    pair: {
                        asset_infos: [
                            {
                                token: {
                                    contract_addr: "${contract_addr}"
                                },
                            },
                            {
                                native_token: {
                                    denom: "uusd",
                                },
                            },
                        ],
                    },
                }`

                let querySegment = `
                        ${denom}: contractQuery(contractAddress: "${astroportFactoryAddress}", query: ${pairQuery})
                    `

                queries += querySegment
            })
        return `${wasmPairKey}: wasm {
                    ${queries}
                }`
    }

    const astroportFactoryAddress =
        oracleAddresses?.contracts?.astroportFactoryAddress || ''
    const wasmPairKey = 'astroportPairWasmQuery'
    const wasmPairQuery = produceWasmPairQuery(
        astroportFactoryAddress,
        wasmPairKey
    )

    const pairQuery = gql` query AstroPortPairQuery{
                        ${wasmPairQuery}
                    }`

    const {
        loading: pairQueryLoading,
        data: pairQueryData,
        error: pairQueryError,
    } = useQuery(pairQuery, {
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true,
        skip: !otherAssets || !astroportFactoryAddress,
    })

    useEffect(() => {
        const initialise = () => {
            if (pairQueryData && !pairQueryLoading && !pairQueryError) {
                const wasmQueryResults = pairQueryData[wasmPairKey]
                const infos: AssetPairInfo[] = []

                otherAssets
                    ?.filter(
                        (otherAsset: OtherAsset) =>
                            !!otherAsset.denom && !!otherAsset.contract_addr
                    )
                    .forEach((otherAsset: OtherAsset) => {
                        const denom = otherAsset.denom
                        const pairQueryResponse: PairQueryResponse =
                            wasmQueryResults[`${denom}`]
                        if (!pairQueryResponse?.contract_addr) return
                        infos.push({
                            denom: denom,
                            contract_addr: pairQueryResponse.contract_addr,
                        })
                    })
                setAssetPairInfos(infos)
            }
        }
        initialise()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pairQueryData])

    useEffect(() => {
        const initialise = () => {
            if (pairQueryError && state !== State.ERROR && !pairQueryData) {
                setState(State.ERROR)
            }
        }
        initialise()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pairQueryError])

    const produceWasmPoolQuery = (
        astroportFactoryAddress: string,
        wasmPoolKey: string
    ) => {
        let queries = ``
        if (
            !otherAssets ||
            !astroportFactoryAddress ||
            !wasmPoolKey ||
            !assetPairInfos?.length
        )
            return 'error'

        otherAssets
            .filter((otherAsset: OtherAsset) => !!otherAsset.contract_addr)
            .forEach((otherAsset: OtherAsset) => {
                const denom = otherAsset.denom
                const pair_contract_addr = assetPairInfos.find(
                    (asset: AssetPairInfo) => asset.denom === denom
                )?.contract_addr

                // Didn't find a pair contract address on astroport for this asset? can't execute the the pool query then.
                if (!pair_contract_addr) {
                    return
                } else {
                    const poolQuery = `{ pool: {} }`

                    let querySegment = `
                        ${denom}: contractQuery(contractAddress: "${pair_contract_addr}", query: ${poolQuery})
                    `

                    queries += querySegment
                }
            })
        return `${wasmPoolKey}: wasm {
                    ${queries}
                }`
    }

    const wasmPoolKey = 'astroportPoolWasmQuery'
    const wasmPoolQuery = produceWasmPoolQuery(
        astroportFactoryAddress,
        wasmPoolKey
    )

    const poolQuery = gql` query AstroportPoolQuery{
                        ${wasmPoolQuery}
                    }`

    const {
        loading: poolQueryLoading,
        data: poolQueryData,
        error: poolQueryError,
        refetch: poolQueryRefetch,
    } = useQuery(poolQuery, {
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true,
        pollInterval: 10000,
        skip:
            !otherAssets || !astroportFactoryAddress || !assetPairInfos?.length,
    })

    if (poolQueryError && state !== State.ERROR && !poolQueryData) {
        setState(State.ERROR)
    }

    useEffect(() => {
        const initialise = () => {
            if (poolQueryError && state !== State.ERROR && !poolQueryData) {
                setState(State.ERROR)
            }
        }
        initialise()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poolQueryError])

    useEffect(() => {
        const initialise = () => {
            if (poolQueryData && !poolQueryLoading && !poolQueryError) {
                const wasmQueryResults = poolQueryData[wasmPoolKey]
                const exchangeRates: Coin[] = []

                otherAssets
                    ?.filter(
                        (otherAsset: OtherAsset) =>
                            !!otherAsset.denom && !!otherAsset.contract_addr
                    )
                    .forEach((otherAsset: OtherAsset) => {
                        const denom = otherAsset.denom
                        const poolQueryResponse: PoolQueryResponse =
                            wasmQueryResults[`${denom}`]

                        if (
                            !poolQueryResponse ||
                            !poolQueryResponse.assets.length
                        )
                            return

                        const asset0 = poolQueryResponse.assets[0].info
                            .native_token
                            ? poolQueryResponse.assets[0]
                            : poolQueryResponse.assets[1]
                        const asset1 = poolQueryResponse.assets[0].info
                            .native_token
                            ? poolQueryResponse.assets[1]
                            : poolQueryResponse.assets[0]

                        const exchangeRate = asset0.amount / asset1.amount || 0

                        exchangeRates.push(new Coin(denom, exchangeRate))
                    })
                setuusdExchangeRates(exchangeRates)
                setState(State.READY)
            }
        }
        initialise()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poolQueryData])

    return { state, uusdExchangeRates, refetch: poolQueryRefetch }
}
