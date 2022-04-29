import { useEffect, useState } from 'react'
import createContext from './createContext'
import { useContract } from './'
import useStore from '../store'

export interface IncentivesState {
    balance: number | undefined
    initialised: boolean
    refetch: () => void
}

export const [useIncentives, IncentivesProvider] =
    createContext<IncentivesState>('useIncentives')

export const useIncentivesState = (
    incentivesContractAddress: string | undefined
): IncentivesState => {
    const { query } = useContract()
    const userWalletAddress = useStore((s) => s.userWalletAddress)
    const lcd = useStore((s) => s.networkConfig?.lcd)
    const chainID = useStore((s) => s.networkConfig?.chainID)

    const [refetchRequired, setRefetchRequired] = useState(true)
    const [balance, setBalance] = useState<number | undefined>()
    const [initialised, setIntialised] = useState(false)

    useEffect(
        () => {
            const getUserUnclaimedRewards = async () => {
                if (
                    !userWalletAddress ||
                    !incentivesContractAddress ||
                    !refetchRequired
                )
                    return

                const userUnclaimedRewards = await query<number>(
                    incentivesContractAddress,
                    {
                        user_unclaimed_rewards: {
                            user_address: userWalletAddress,
                        },
                    },
                    undefined,
                    true
                )
                setBalance(Number(userUnclaimedRewards) || 0)
                setRefetchRequired(false)
                setIntialised(true)
            }
            getUserUnclaimedRewards()
        },
        // eslint-disable-next-line
        [
            refetchRequired,
            lcd,
            chainID,
            userWalletAddress,
            incentivesContractAddress,
        ]
    )

    const refetch = () => setRefetchRequired(true)

    return {
        balance,
        initialised,
        refetch,
    }
}
