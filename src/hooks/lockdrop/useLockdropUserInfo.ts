import { useState, useEffect } from 'react'

import createContext from '../createContext'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import useStore from '../../store'

export interface UserInfo {
    total_ust_locked: string
    total_maust_share: string
    lockup_position_ids: string[]
    total_mars_incentives: string
    delegated_mars_incentives: string
    is_lockdrop_claimed: boolean
    reward_index: number
    total_xmars_claimed: string
    pending_xmars_to_claim: string
}

export interface LockdropUserInfo {
    userInfo: UserInfo | undefined
    initialised: boolean
    getLockdropBalance: () => number
    refetch: () => void
}

export const [useLockdropUserInfo, LockdropUserInfoProvider] =
    createContext<LockdropUserInfo>('useLockdropUserInfo')

export const useLockdropUserInfoState = (address: string): LockdropUserInfo => {
    const [userInfo, setUserInfo] = useState<UserInfo | undefined>()
    const [initialised, setIntialised] = useState(false)
    const [rawData, setRawData] = useState<object>()
    const lockdropAddresses = useStore((s) => s.lockdropAddresses)

    const wasmKey = 'lockdropUserInfoWasm'
    const query = gql`
        query LockdropUserInfoQuery(
            $lockdropAddress: String!,
            $address: String!) {
            ${wasmKey}: wasm {
                userInfo :contractQuery(contractAddress: $lockdropAddress, query: { user_info: { address: $address } })
        }
    }`

    const { data, loading, error, refetch } = useQuery(query, {
        variables: {
            lockdropAddress: lockdropAddresses?.lockdropAddress,
            address: address,
        },
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true,
        pollInterval: 60000,
        skip: !lockdropAddresses?.lockdropAddress || !address,
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

    const getLockdropBalance = (): number => {
        if (userInfo?.is_lockdrop_claimed) return 0

        return (
            (Number(userInfo?.total_mars_incentives) || 0) -
            (Number(userInfo?.delegated_mars_incentives) || 0)
        )
    }

    return { userInfo, initialised, getLockdropBalance, refetch }
}
