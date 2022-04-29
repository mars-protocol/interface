import { useState, useEffect } from 'react'

import createContext from '../createContext'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { AIRDROP_CLAIM_FEATURE } from '../../constants/appConstants'
import useStore from '../../store'

export interface AirdropConfig {
    /// Account who can update config
    owner: string
    /// MARS token address
    mars_token_address: string
    /// Merkle roots used to verify is a terra user is eligible for the airdrop
    merkle_roots: string[]
    /// Timestamp since which MARS airdrops can be delegated to bootstrap auction contract
    from_timestamp: number
    /// Timestamp till which MARS airdrops can be claimed
    to_timestamp: number
    /// Bootstrap auction contract address
    auction_contract_address?: string
    /// Boolean value indicating if the users can withdraw their MARS airdrop tokens or not
    /// This value is updated in the same Tx in which Liquidity is added to the LP Pool
    are_claims_allowed: boolean
}

export interface AirdropState {
    /// Total MARS issuance used as airdrop incentives
    total_airdrop_size: string
    /// Total MARS tokens that have been delegated to the bootstrap auction pool
    total_delegated_amount: string
    /// Total MARS tokens that are yet to be claimed by the users
    unclaimed_tokens: string
}

export interface UserInfo {
    /// Total MARS airdrop tokens claimable by the user
    airdrop_amount: string
    /// MARS tokens delegated to the bootstrap auction contract to add to the user's position
    delegated_amount: string
    /// Boolean value indicating if the user has withdrawn the remaining MARS tokens
    tokens_withdrawn: boolean
}

export interface AirdropData {
    address: string
    amount: string
    merkle_proof: string[]
    index: number
}

export interface Airdrop {
    config: AirdropConfig | undefined
    state: AirdropState | undefined
    userInfo: UserInfo | undefined
    airdropData: AirdropData | undefined
    initialised: boolean
    refetch: () => void
    getAirdropBalance: () => number
}

export const [useAirdrop, AirdropProvider] =
    createContext<Airdrop>('useAirdrop')

export const useAirdropState = (address: string): Airdrop => {
    const [config, setConfig] = useState<AirdropConfig | undefined>()
    const [state, setState] = useState<AirdropState | undefined>()
    const [userInfo, setUserInfo] = useState<UserInfo | undefined>()
    const [airdropData, setAirdropData] = useState<AirdropData | undefined>()
    const [initialisedContractQueries, setInitialisedContractQueries] =
        useState(false)
    const [initialisedAirdropData, setInitialisedAirdropData] = useState(false)
    const [rawData, setRawData] = useState<object>()
    const lockdropAddresses = useStore((s) => s.lockdropAddresses)
    const networkConfig = useStore((s) => s.networkConfig)

    const wasmKey = 'airdropWasm'
    const query = gql`
        query AirdropQuery(
            $airdropAddress: String!,
            $address: String!) {
            ${wasmKey}: wasm {
                config : contractQuery(contractAddress: $airdropAddress, query: { config : {} })
                state :contractQuery(contractAddress: $airdropAddress, query: { state:  {} })
                userInfo :contractQuery(contractAddress: $airdropAddress, query: { user_info: { address: $address } })
        }
    }`

    const { data, loading, error, refetch } = useQuery(query, {
        variables: {
            airdropAddress: lockdropAddresses?.airdropAddress,
            address: address,
        },
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true,
        pollInterval: 10000, // small and many people will be claiming still
        skip: !lockdropAddresses?.airdropAddress || !address,
    })

    const getAirdropData = async (address: string): Promise<AirdropData> => {
        const result = await fetch(
            `${networkConfig!.airdropWebServiceURL}/${address}`
        )

        return result.status === 200
            ? await result.json()
            : {
                  address,
                  amount: '0',
                  merkle_proof: '',
              }
    }

    useEffect(() => {
        const initialise = async () => {
            if (!address || !networkConfig) return
            if (AIRDROP_CLAIM_FEATURE) {
                setAirdropData(await getAirdropData(address))
            }
            setInitialisedAirdropData(true)
        }
        initialise()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, networkConfig])

    useEffect(() => {
        const initialise = () => {
            if (!error && !loading && data !== rawData) {
                if (!data || !data[wasmKey]) return
                const wasmData = data[wasmKey]
                setRawData(data)
                setConfig(wasmData.config)
                setState(wasmData.state)
                setUserInfo(wasmData.userInfo)
                setInitialisedContractQueries(true)
            }
        }
        initialise()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    const getAirdropBalance = (): number => {
        if (
            !airdropData ||
            !userInfo ||
            !(initialisedContractQueries && initialisedAirdropData) ||
            userInfo.tokens_withdrawn
        )
            return 0

        if (Number(userInfo.airdrop_amount) === 0)
            return Number(airdropData.amount)

        return (
            Number(userInfo.airdrop_amount) - Number(userInfo.delegated_amount)
        )
    }

    return {
        config,
        state,
        userInfo,
        airdropData,
        initialised: initialisedContractQueries && initialisedAirdropData,
        refetch,
        getAirdropBalance,
    }
}
