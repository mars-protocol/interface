import { useState, useEffect } from 'react'

import createContext from '../createContext'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import useStore from '../../store'

export interface UserInfo {
    mars_deposited: string
    ust_deposited: string
    ust_withdrawn_flag: boolean
    lp_shares: string
    withdrawn_lp_shares: string
    withdrawable_lp_shares: string
    total_auction_incentives: string
    withdrawn_auction_incentives: string
    withdrawable_auction_incentives: string
    mars_reward_index: number
    withdrawable_mars_incentives: string
    withdrawn_mars_incentives: string
    astro_reward_index: number
    withdrawable_astro_incentives: string
    withdrawn_astro_incentives: string
}

export interface AuctionUserInfo {
    userInfo: UserInfo | undefined
    initialised: boolean
    refetch: () => void
}

export const [useAuctionUserInfo, AuctionUserInfoProvider] =
    createContext<AuctionUserInfo>('useAuctionUserInfo')

export const useAuctionUserInfoState = (address: string): AuctionUserInfo => {
    const [userInfo, setUserInfo] = useState<UserInfo | undefined>()
    const [initialised, setIntialised] = useState(false)
    const [rawData, setRawData] = useState<object>()
    const lockdropAddresses = useStore((s) => s.lockdropAddresses)

    const wasmKey = 'auctionUserInfoWasm'
    const query = gql`
        query AuctionUserInfoQuery(
            $auctionAddress: String!,
            $address: String!) {
            ${wasmKey}: wasm {
                userInfo :contractQuery(contractAddress: $auctionAddress, query: { user_info: { address: $address } })
        }
    }`

    const { data, loading, error, refetch } = useQuery(query, {
        variables: {
            auctionAddress: lockdropAddresses?.auctionAddress,
            address: address,
        },
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true,
        pollInterval: 60000,
        skip: !lockdropAddresses?.auctionAddress || !address,
    })

    useEffect(() => {
        const initialise = () => {
            if (!error && !loading && data !== rawData) {
                if (!data || !data[wasmKey]) return
                const wasmData = data[wasmKey]
                setRawData(data)
                setUserInfo(wasmData.userInfo)
                setIntialised(true)
            }
        }
        initialise()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    useEffect(() => {
        if (!address) {
            setUserInfo(undefined)
            setIntialised(false)
            return
        }
        // eslint-disable-next-line
    }, [address])

    return {
        userInfo,
        initialised,
        refetch,
    }
}
