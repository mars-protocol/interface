import { useState, useEffect } from 'react'
import { Coin, Denom } from '@terra-money/terra.js'

import createContext from './createContext'
import { MarketQuery } from './useRedBank'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
import { accountBalanceQuery } from '../queries/accountBalanceQuery'
import { State } from '../types/enums'
import useStore from '../store'

export interface AccountBalance {
    coins: Coin[] | undefined
    debts: Coin[] | undefined
    deposits: Coin[] | undefined
    state: State
    find: (key: Denom) => Coin | undefined
    findDebt: (key: Denom) => Coin | undefined
    findDeposit: (key: Denom) => Coin | undefined
    convertMaTokenToUnderlying: (key: Denom, maTokenAmount: number) => number
    refetch: () => void
}

interface DebtQueryResponse {
    debts: [
        {
            denom: string
            amount_scaled: string
        }
    ]
}

export const [useAccountBalance, AccountBalanceProvider] =
    createContext<AccountBalance>('useAccountBalance')

export const useAccountBalanceState = (
    address: string,
    findMarketInfo: (key: Denom) => MarketQuery | undefined
): AccountBalance => {
    const [coins, setCoins] = useState<Coin[] | undefined>(undefined)
    const [deposits, setDeposits] = useState<Coin[] | undefined>(undefined)
    const [debts, setDebts] = useState<Coin[] | undefined>(undefined)
    const [state, setState] = useState(State.INITIALISING)
    const [fetchedData, setFetchedData] = useState<object>()
    const [refetchRequired, setRefetchRequired] = useState(true)
    const lcd = useStore((s) => s.networkConfig?.lcd)
    const chainID = useStore((s) => s.networkConfig?.chainID)
    const networkAddresses = useStore((s) => s.networkAddresses)
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const otherAssets = useStore((s) => s.otherAssets)
    const allAssets = [...(whitelistedAssets || []), ...(otherAssets || [])]

    const wasmKey = 'accountBalanceWasm'
    const { data, loading, error, refetch } = useQuery(
        gql`
            query ${accountBalanceQuery(
                address,
                wasmKey,
                allAssets || [],
                networkAddresses
            )}
        `,
        {
            fetchPolicy: 'network-only',
            pollInterval: 30000,
            nextFetchPolicy: 'no-cache',
            skip: !address || (!allAssets?.length && !networkAddresses),
        }
    )

    if (error && state !== State.ERROR && !data) {
        setState(State.ERROR)
    }

    if (!loading && !error && data && data !== fetchedData) {
        setFetchedData(data)
        const wasmQueryResults = data[wasmKey]
        const bankQueryResults = data.balance
        const newDeposits: Coin[] = []
        const rawBalances: Coin[] = bankQueryResults.balance
        const newCoins: Coin[] = rawBalances.map(
            (coin) => new Coin(coin.denom, coin.amount)
        )

        allAssets?.forEach((asset: WhitelistAsset) => {
            const denom = asset.denom
            if (denom) {
                if (asset.contract_addr) {
                    const newCoin: Coin = new Coin(
                        denom,
                        wasmQueryResults[denom]?.balance || 0
                    )
                    newCoins.push(newCoin)
                }

                // Only whitelisted assets will have red bank deposit balences
                if (whitelistedAssets?.find((d) => d.denom === denom)) {
                    const deposit = wasmQueryResults[`${denom}Deposit`]
                    if (deposit) {
                        newDeposits.push(
                            new Coin(
                                denom,
                                wasmQueryResults[`${denom}Deposit`].balance
                            )
                        )
                    }
                }
            }
        })

        const debtsResponse: DebtQueryResponse = wasmQueryResults?.debts
        if (debtsResponse?.debts) {
            setDebts(
                debtsResponse.debts.map((debt) => {
                    return new Coin(debt.denom, debt.amount_scaled)
                })
            )
        }

        setCoins(newCoins)
        setDeposits(newDeposits)
        setState(State.READY)
        setRefetchRequired(false)
    }

    useEffect(() => {
        if (!address) {
            setDebts([])
            setCoins([])
            setState(State.ERROR)
            return
        }

        if (!networkAddresses) {
            setCoins([])
            setState(State.READY)
            setRefetchRequired(false)
            return
        }

        if (
            !refetchRequired ||
            !lcd ||
            !chainID ||
            !whitelistedAssets ||
            !otherAssets
        )
            return

        // eslint-disable-next-line
    }, [
        address,
        lcd,
        chainID,
        networkAddresses,
        whitelistedAssets,
        otherAssets,
        refetchRequired,
    ])

    // If a new wallet connects we need to refetch balances
    useEffect(() => {
        if (address) {
            setRefetchRequired(true)
        }
    }, [address])

    const find = (denom: Denom) => {
        return coins && coins.find((coin) => coin.denom === denom)
    }

    const findDeposit = (denom: Denom) => {
        const asset = (allAssets || []).find(
            (maAsset) => maAsset.denom === denom
        )
        const deposit =
            deposits && deposits.find((coin) => coin.denom === asset?.denom)
        const scaledAmount = convertMaTokenToUnderlying(
            denom,
            Number(deposit?.amount) || 0
        )
        return new Coin(asset?.denom || '', scaledAmount)
    }

    const convertMaTokenToUnderlying = (
        denom: Denom,
        maTokenAmount: number
    ) => {
        const marketInfo = findMarketInfo(denom)
        // Mars contracts scale/multiply everything by 1e6 to add accuracy, so we need to do the opposite here and divide by 1e6
        const scaledAmount =
            (maTokenAmount / 1e6) * (marketInfo?.liquidity_index || 1)
        return scaledAmount
    }

    const findDebt = (denom: Denom) => {
        const marketInfo = findMarketInfo(denom)

        // scale our debt by the index to get the correct amount
        const debt = debts && debts.find((debt) => debt.denom === denom)
        // Mars contracts scale/multiply everything by 1e6 to add accuracy, so we need to do the opposite here and divide by 1e6
        const scaledAmount =
            (Number(debt?.amount) / 1e6) * (marketInfo?.borrow_index || 1)

        return new Coin(denom, scaledAmount)
    }

    return {
        state,
        coins,
        debts,
        deposits,
        find,
        findDebt,
        refetch,
        findDeposit,
        convertMaTokenToUnderlying,
    }
}
