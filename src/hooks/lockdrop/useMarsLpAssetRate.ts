import { useEffect, useState } from 'react'

import createContext from '../createContext'
import { gql, useQuery } from '@apollo/client'
import { contractQuery } from '../../queries/contractQuery'
import { State } from '../../types/enums'
import useStore from '../../store'

export interface MarsLpAssetRates {
    state: State
    marsLpToAssets: (marsLpAmount: number) => LpToAssetsResponse
    refetch: () => void
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

export interface LpToAssetsResponse {
    mars: number
    uusd: number
}

export const [useMarsLpAssetRate, MarsLpAssetRateProvider] =
    createContext<MarsLpAssetRates>('useMarsLpAssetRate')

export const useMarsLpAssetRateState = (): MarsLpAssetRates => {
    const lockdropAddresses = useStore((s) => s.lockdropAddresses)
    const [marsAssetInfo, setMarsAssetInfo] = useState<Asset>()
    const [uusdAssetInfo, setUusdAssetInfo] = useState<Asset>()
    const [lpTokensInCirculation, setLpTokensInCirculation] = useState<number>()
    const [state, setState] = useState<State>(State.INITIALISING)
    const wasmKey = 'marsLpAssetRateWasm'

    const producePoolQuery = () => {
        if (!lockdropAddresses?.astroportMarsUstPoolAddress) return 'ping'
        const query = contractQuery(
            'poolQueryResponse',
            lockdropAddresses?.astroportMarsUstPoolAddress,
            '{ pool : {} }'
        )

        return `${wasmKey}: wasm {
                    ${query}
        }`
    }

    const poolQuery = gql`query MarsLpAssetRateQuery {
        ${producePoolQuery()}
    }`
    const { data, loading, error, refetch } = useQuery(poolQuery, {
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true,
        pollInterval: 60000,
        skip: !lockdropAddresses?.astroportMarsUstPoolAddress,
    })

    useEffect(() => {
        if (error || loading || !data) return

        const response: PoolQueryResponse = data[wasmKey]?.poolQueryResponse
        if (response) {
            const uusd = response.assets[0].info.native_token
                ? response.assets[0]
                : response.assets[1]
            const mars = response.assets[0].info.native_token
                ? response.assets[1]
                : response.assets[0]

            setUusdAssetInfo(uusd)
            setMarsAssetInfo(mars)
            setLpTokensInCirculation(response.total_share)
        }

        setState(State.READY)
    }, [data, error, loading])

    const marsLpToAssets = (marsLpAmount: number): LpToAssetsResponse => {
        if (!marsLpAmount || state !== State.READY || !lpTokensInCirculation)
            return { mars: 0, uusd: 0 }

        const lpRatio =
            lpTokensInCirculation === 0
                ? 0
                : marsLpAmount / lpTokensInCirculation
        const marsFromLpPosition = lpRatio * (marsAssetInfo?.amount || 0)
        const uusdFromLpPosition = lpRatio * (uusdAssetInfo?.amount || 0)

        return { mars: marsFromLpPosition, uusd: uusdFromLpPosition }
    }

    return { state, marsLpToAssets, refetch }
}
