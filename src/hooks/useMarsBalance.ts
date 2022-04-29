import { useState, useEffect } from 'react'
import { Coin, Denom } from '@terra-money/terra.js'
import createContext from './createContext'
import { MARS_DENOM, XMARS_DENOM } from '../constants/appConstants'

import { ContractQueryResponse } from './useCW20'
import { gql, useQuery } from '@apollo/client'

export interface BalanceResponse {
    result: {
        balance: number
    }
}

export interface TokenInfoResponse {
    name: string
    symbol: string
    decimals: number
    total_supply: string
}

export interface MarsBalance {
    initialised: boolean
    findBalance: (key: Denom) => Coin | undefined
    refetch: () => void
}

export const [useMarsBalance, MarsBalanceProvider] =
    createContext<MarsBalance>('useMarsBalance')

export interface TokenSpecification {
    denom: string
    contractAddress: string
}

export const useMarsBalanceState = (
    marsTokenAddress: string | undefined,
    xmarsTokenAddress: string | undefined,
    address: string
): MarsBalance => {
    const [balances, setBalances] = useState<Coin[] | undefined>()
    const [initialised, setIntialised] = useState(false)
    const [loadedData, setLoadedData] = useState<object>()

    const tokens: Array<TokenSpecification> = []
    tokens.push({ denom: MARS_DENOM, contractAddress: marsTokenAddress || '' })
    tokens.push({
        denom: XMARS_DENOM,
        contractAddress: xmarsTokenAddress || '',
    })

    const marsBalanceQuery = gql`
        query marsBalanceQuery(
            $userAddress: String!
            $marsTokenAddress: String!
            $xMarsTokenAddress: String!
        ) {
            marsBalanceWasm: wasm {
                MARSBalance: contractQuery(
                    contractAddress: $marsTokenAddress
                    query: { balance: { address: $userAddress } }
                )
                XMARSBalance: contractQuery(
                    contractAddress: $xMarsTokenAddress
                    query: { balance: { address: $userAddress } }
                )
            }
        }
    `
    const {
        data,
        loading,
        error,
        refetch: refetchData,
    } = useQuery(marsBalanceQuery, {
        variables: {
            userAddress: address,
            marsTokenAddress: marsTokenAddress,
            xMarsTokenAddress: xmarsTokenAddress,
        },
        fetchPolicy: 'network-only',
        pollInterval: 20000,
        nextFetchPolicy: 'no-cache',
        skip: !address || !marsTokenAddress || !xmarsTokenAddress,
    })

    if (!loading && !error && data && loadedData !== data) {
        setLoadedData(data)
        const newCoins: Coin[] = []
        const queryResult = data.marsBalanceWasm
        tokens.forEach((token: TokenSpecification) => {
            const denom = token.denom
            const balance: ContractQueryResponse =
                queryResult[`${denom}Balance`]
            newCoins.push(new Coin(denom, balance.balance))
        })
        setBalances(newCoins)
        setIntialised(true)
    }

    // If a new wallet connects we need to refetch balances
    useEffect(() => {
        if (address) {
            refetchData()
        }
    }, [address, refetchData])

    const findBalance = (denom: Denom) =>
        balances && balances.find((coin) => coin.denom === denom)

    const refetch = () => refetchData()

    return {
        initialised,
        findBalance,
        refetch,
    }
}
