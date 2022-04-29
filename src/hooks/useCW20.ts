import createContext from './createContext'
import { useContract } from './useContract'

export interface ContractQueryResponse {
    balance: string
}

export interface CW20 {
    findSpecificAddressBalance: (
        address: string,
        cw20Address: string
    ) => Promise<string>
}

export const [useCW20, CW20Provider] = createContext<CW20>('useCW20')

export const useCW20State = (): CW20 => {
    const { query } = useContract()

    const findSpecificAddressBalance = async (
        address: string,
        cw20Address: string
    ) => {
        const result = await query<ContractQueryResponse>(cw20Address, {
            balance: { address: address },
        })
        return result?.balance || '0'
    }

    return { findSpecificAddressBalance }
}
