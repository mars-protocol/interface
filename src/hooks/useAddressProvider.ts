import { useState, useEffect } from 'react'

import createContext from './createContext'
import { BasecampConfig } from './useBasecamp'
import { useContract } from './useContract'
import useStore from '../store'

export interface AddressProviderConfig {
    owner: string
    council_address: string
    incentives_address: string
    safety_fund_address: string
    mars_token_address: string
    oracle_address: string
    red_bank_address: string
    staking_address: string
    treasury_address: string
    xmars_token_address: string
    protocol_admin: string
    vesting_address: string
}

export interface AddressProvider {
    config: AddressProviderConfig | undefined
    initialised: boolean
    refetch: () => void
}

export const [useAddressProvider, AddressProviderProvider] =
    createContext<AddressProvider>('useAddressProvider')

export const useAddressProviderState = (
    basecampConfig: BasecampConfig | undefined
): AddressProvider => {
    const [config, setConfig] = useState<AddressProviderConfig | undefined>()
    const [initialised, setIntialised] = useState(false)
    const [refetchRequired, setRefetchRequired] = useState(true)
    const lcd = useStore((s) => s.networkConfig?.lcd)
    const chainID = useStore((s) => s.networkConfig?.chainID)
    const { query } = useContract()

    useEffect(
        () => {
            const getConfig = async () => {
                if (!refetchRequired || !basecampConfig) return

                const addressProviderConfig =
                    await query<AddressProviderConfig>(
                        basecampConfig.address_provider_address,
                        { config: {} }
                    )

                setConfig(addressProviderConfig)
                setIntialised(true)
                setRefetchRequired(false)
            }
            getConfig()
        },
        // eslint-disable-next-line
        [lcd, chainID, basecampConfig, refetchRequired]
    )

    const refetch = () => setRefetchRequired(true)

    return { config, initialised, refetch }
}
