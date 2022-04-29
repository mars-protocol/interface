import { useState, useEffect } from 'react'

import createContext from '../createContext'
import { useQuery } from '@apollo/client'
import { contractQuery } from '../../queries/contractQuery'
import gql from 'graphql-tag'
import { State } from '../../types/enums'
import useStore from '../../store'

interface LockDropPositionObject {
    /// Lockup Duration
    duration: number
    /// UST locked as part of this lockup position
    ust_locked: string
    /// MA-UST share
    maust_balance: string
    /// Lockdrop incentive distributed to this position
    lockdrop_reward: string
    /// Timestamp beyond which this position can be unlocked
    unlock_timestamp: number
    /// Boolean value indicating if the user's has withdrawn funds post the only 1 withdrawal limit cutoff
    withdrawal_flag: boolean
}

interface LockdropLockupPositions {
    lockupPositions: LockDropPositionObject[] | undefined
    state: State
    refetch: () => void
}

export const [useLockdropLockupPositions, LockdropLockupPositionsProvider] =
    createContext<LockdropLockupPositions>('useLockdropLockupPositions')

export const useLockdropLockupPositionsState = (
    address: string,
    lockupPositionIds: string[] | undefined
): LockdropLockupPositions => {
    const [lockupPositions, setLockupPositions] = useState<
        LockDropPositionObject[] | undefined
    >()
    const [state, setState] = useState(State.INITIALISING)
    const [rawData, setRawData] = useState<object>()
    const lockdropAddresses = useStore((s) => s.lockdropAddresses)

    const positionQuery = (positionId: string) => {
        return `
        {
            lockup_info_with_id: {
                lockup_id: "${positionId}"
            }
        }
        `
    }

    const buildQuery = () => {
        if (!lockdropAddresses?.lockdropAddress || !lockupPositionIds?.length)
            return

        const queries: string[] = lockupPositionIds?.map((positionId) => {
            return contractQuery(
                positionId,
                lockdropAddresses?.lockdropAddress,
                positionQuery(positionId)
            )
        })

        return queries
    }

    const query = buildQuery()
    const { data, loading, error, refetch } = useQuery(
        gql`
        query LockdropLockupPositionsQuery { lockdropLockupPositionsWasm: wasm { ${query} } }
    `,
        {
            variables: {
                lockdropAddress: lockdropAddresses?.lockdropAddress,
            },
            fetchPolicy: 'no-cache',
            notifyOnNetworkStatusChange: true,
            pollInterval: 60000,
            skip:
                !lockdropAddresses?.lockdropAddress ||
                !lockupPositionIds?.length,
        }
    )

    if (error && state !== State.ERROR) {
        setState(State.ERROR)
    }

    useEffect(() => {
        const initialise = () => {
            if (!error && !loading && data && data !== rawData) {
                if (!data?.lockdropLockupPositionsWasm) return

                const userPositions: LockDropPositionObject[] = []
                lockupPositionIds?.forEach((positionId) => {
                    const position =
                        data?.lockdropLockupPositionsWasm[positionId]
                    if (position?.lockup_info) {
                        userPositions.push(position?.lockup_info)
                    }
                })

                setRawData(data)
                setLockupPositions(userPositions)
                setState(State.READY)
            } else if (!lockupPositionIds?.length && lockupPositions?.length) {
                setLockupPositions([])
            }
        }
        initialise()
    }, [data, error, loading, lockupPositionIds, rawData, lockupPositions])

    useEffect(() => {
        if (!address) {
            setLockupPositions(undefined)
            setState(State.ERROR)
            return
        }
        // eslint-disable-next-line
    }, [address])

    return { lockupPositions, state, refetch }
}
