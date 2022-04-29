import { useState, useEffect } from 'react'

import createContext from './createContext'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'

export interface Vesting {
    votingPowerAt: string | undefined
    totalVotingPowerAt: string | undefined
    initialised: boolean
    refetch: () => void
}

export const [useVesting, VestingProvider] =
    createContext<Vesting>('useVesting')

export const useVestingState = (
    address: string,
    vestingAddress: string | undefined,
    latestBlockHeight: number
): Vesting => {
    const [votingPowerAt, setVotingPowerAt] = useState<string>()
    const [totalVotingPowerAt, setTotalVotingPowerAt] = useState<string>()
    const [initialised, setIntialised] = useState(false)
    const [rawData, setRawData] = useState<object>()

    const wasmKey = 'vestingWasm'
    const query = gql`
        query VestingQuery(
            $address: String!,
            $vestingAddress: String!,
            $latestBlockHeight: Float!) {
            ${wasmKey}: wasm {
                votingPowerAt :contractQuery(contractAddress: $vestingAddress, query: { voting_power_at: { user_address: $address, block: $latestBlockHeight } })
                totalVotingPowerAt :contractQuery(contractAddress: $vestingAddress, query: { total_voting_power_at: { block: $latestBlockHeight } })
        }
    }`

    const { data, loading, error, refetch } = useQuery(query, {
        variables: {
            address,
            vestingAddress,
            latestBlockHeight: Number(latestBlockHeight),
        },
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true,
        pollInterval: 60000,
        skip: !address || !vestingAddress || !latestBlockHeight,
    })

    useEffect(() => {
        const initialise = () => {
            if (!error && !loading && data && data !== rawData) {
                if (!data || !data[wasmKey]) return
                const wasmData = data[wasmKey]
                setRawData(data)
                setVotingPowerAt(wasmData.votingPowerAt || 0)
                setTotalVotingPowerAt(wasmData.totalVotingPowerAt || 0)
                setIntialised(true)
            }
        }
        initialise()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    useEffect(() => {
        if (!address) {
            setIntialised(false)
            return
        }
        // eslint-disable-next-line
    }, [address])

    return { votingPowerAt, totalVotingPowerAt, initialised, refetch }
}
