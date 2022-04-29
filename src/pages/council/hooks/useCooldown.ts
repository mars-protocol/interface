import { useEffect, useState } from 'react'
import createContext from '../../../hooks/createContext'
import { useContract, useAddressProvider } from '../../../hooks'
import useStore from '../../../store'

export interface Claim {
    created_at_block: number
    cooldown_end_timestamp: number
    amount: string
}

interface CooldownResponse {
    claim: Claim | undefined
}

export interface CooldownState {
    claim: Claim | undefined
    initialised: boolean
    refetch: () => void
}

export const [useCooldown, CooldownProvider] =
    createContext<CooldownState>('useCooldown')

export const useCooldownState = (): CooldownState => {
    const [claim, setClaim] = useState<Claim | undefined>()
    const [initialised, setIntialised] = useState(false)
    const [refetchRequired, setRefetchRequired] = useState(true)
    const lcd = useStore((s) => s.networkConfig?.lcd)
    const chainID = useStore((s) => s.networkConfig?.chainID)
    const { config } = useAddressProvider()
    const userWalletAddress = useStore((s) => s.userWalletAddress)
    const { query } = useContract()

    useEffect(
        () => {
            const getCooldown = async () => {
                if (!refetchRequired || !config) return
                try {
                    const cooldown = await query<CooldownResponse>(
                        config.staking_address,
                        { claim: { user_address: userWalletAddress } },
                        undefined,
                        true
                    )

                    cooldown && cooldown.claim !== null
                        ? setClaim(cooldown.claim)
                        : setClaim(undefined)
                } catch {
                    // clear cooldown
                    setClaim(undefined)
                }
                setRefetchRequired(false)
                setIntialised(true)
            }
            getCooldown()
        },
        // eslint-disable-next-line
        [lcd, chainID, refetchRequired, userWalletAddress, config]
    )

    const refetch = () => setRefetchRequired(true)

    return { claim: claim, initialised, refetch }
}
