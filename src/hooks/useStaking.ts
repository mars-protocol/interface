import { useState } from 'react'
import createContext from './createContext'
import {
    BLOCKS_PER_DAY,
    MARS_CONTRACT_DEPLOY_HEIGHT,
    STAKING_CONTRACT_DEPLOY_HEIGHT,
    XMARS_CONTRACT_DEPLOY_HEIGHT,
} from '../constants/appConstants'
import { MarsBalance } from './useMarsBalance'
import { gql, useQuery } from '@apollo/client'
import { convertAprToApy } from '../libs/parse'
import useStore from '../store'
export interface StakingConfig {
    owner: string
    address_provider_address: string
    terraswap_max_spread: string
    cooldown_duration: number
    unstake_window: number
}

export interface StakingGlobalState {
    total_mars_for_claimers: number
}

export interface Staking {
    config: StakingConfig | undefined
    apy: number
    initialised: boolean
    xMarsRatio: number
    marsInStakingNow: number
    refetch: () => void
}

export const [useStaking, StakingProvider] =
    createContext<Staking>('useStaking')

export const useStakingState = (
    stakingContractAddress: string | undefined,
    marsBalanceHook: MarsBalance,
    marsTokenAddress: string | undefined,
    xmarsTokenAddress: string | undefined
): Staking => {
    const [config, setConfig] = useState<StakingConfig>()
    const [apy, setApy] = useState<number>(0)
    const [rawData, setRawData] = useState<object>()
    const [xMarsRatio, setXMarsRatio] = useState<number>(0)
    const [marsInStakingNow, setMarsInStatingNow] = useState<number>(0)
    const [initialised, setIntialised] = useState(false)
    const latestBlockHeight = useStore((s) => s.latestBlockHeight)

    const then = Math.max(
        STAKING_CONTRACT_DEPLOY_HEIGHT,
        MARS_CONTRACT_DEPLOY_HEIGHT,
        XMARS_CONTRACT_DEPLOY_HEIGHT,
        latestBlockHeight - BLOCKS_PER_DAY
    )

    const STAKING_QUERY = gql`
        query StakingQuery(
            $stakingAddress: String!
            $xmarsAddress: String!
            $marsAddress: String!
            $then: Float!
        ) {
            wasmKey: wasm {
                config: contractQuery(
                    contractAddress: $stakingAddress
                    query: { config: {} }
                )
                state: contractQuery(
                    contractAddress: $stakingAddress
                    query: { global_state: {} }
                )
                stateAWeekAgo: contractQuery(
                    contractAddress: $stakingAddress
                    query: { global_state: {} }
                    height: $then
                )
                marsInContractNow: contractQuery(
                    contractAddress: $marsAddress
                    query: { balance: { address: $stakingAddress } }
                )
                marsInContractThen: contractQuery(
                    contractAddress: $marsAddress
                    query: { balance: { address: $stakingAddress } }
                    height: $then
                )
                xmarsInCirculationNow: contractQuery(
                    contractAddress: $xmarsAddress
                    query: { token_info: {} }
                )
                xmarsInCirculationThen: contractQuery(
                    contractAddress: $xmarsAddress
                    query: { total_supply_at: { block: $then } }
                )
            }
        }
    `

    const { data, error, loading, refetch } = useQuery(STAKING_QUERY, {
        variables: {
            stakingAddress: stakingContractAddress,
            xmarsAddress: xmarsTokenAddress,
            marsAddress: marsTokenAddress,
            then: then,
        },
        fetchPolicy: 'network-only',
        pollInterval: 30000,
        nextFetchPolicy: 'no-cache',
        skip:
            !stakingContractAddress ||
            !xmarsTokenAddress ||
            !marsTokenAddress ||
            !latestBlockHeight ||
            !marsBalanceHook.initialised,
    })

    const calculateMarsXMarsRatio = (
        marsBalance: number,
        xMarsTotalSupply: number
    ) => {
        if (xMarsTotalSupply === 0) return 0
        return marsBalance / xMarsTotalSupply || 0
    }

    const initialise = async () => {
        if (!error && !loading && data && data !== rawData) {
            const wasmData = data['wasmKey']
            setRawData(data)
            setConfig(wasmData.config)
            const marsInStakingNow =
                Number(wasmData.marsInContractNow?.balance) -
                Number(wasmData.state.total_mars_for_claimers)
            setMarsInStatingNow(marsInStakingNow)
            const marsInStakingThen =
                Number(wasmData.marsInContractThen?.balance) -
                Number(wasmData.stateAWeekAgo.total_mars_for_claimers)

            const xMarsNow = Number(wasmData.xmarsInCirculationNow.total_supply)
            const xMarsThen = Number(
                wasmData.xmarsInCirculationThen.total_supply
            )

            const ratioNow = calculateMarsXMarsRatio(marsInStakingNow, xMarsNow)
            const ratioThen = calculateMarsXMarsRatio(
                marsInStakingThen,
                xMarsThen
            )
            setXMarsRatio(ratioNow)

            const ratioDifference = ratioNow - ratioThen
            if (ratioDifference > 0 && ratioThen > 0) {
                const changeSinceThen = ratioDifference / ratioThen
                const dailyPercentageRate = changeSinceThen * 100
                const apr = dailyPercentageRate * 365.25
                const apy = convertAprToApy(apr, 365.25)
                setApy(apy)
            }
            setIntialised(true)
        }
    }

    initialise()

    return { config, apy, xMarsRatio, marsInStakingNow, initialised, refetch }
}
