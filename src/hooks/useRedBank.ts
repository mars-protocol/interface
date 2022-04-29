import { useState } from 'react'
import { Coin, Denom } from '@terra-money/terra.js'

import createContext from './createContext'
import { gql, useQuery } from '@apollo/client'
import {
    redbankQuery,
    REDBANK_WASM_KEY,
    USER_COLLATERAL_WASM_KEY,
} from '../queries/redbankQuery'
import { State } from '../types/enums'
import useStore from '../store'

export interface MarketQuery {
    denom?: string
    // Values from SC
    ma_token_address?: string
    borrow_index?: number
    liquidity_index?: number
    borrow_rate?: number
    liquidity_rate?: number
    max_loan_to_value?: number
    liquidation_threshold?: number
    active: boolean
    deposit_enabled: boolean
    borrow_enabled: boolean
}

export interface MarketIncentiveQuery {
    denom?: string
    // Values from SC
    asset_incentive?: {
        emission_per_second?: string
        index?: string
        last_updated?: number
    }
}

export interface MarketMaTokenQuery {
    denom?: string
    name: string
    symbol: string
    decimals: number
    total_supply: string
}

export interface UserCollateral {
    collateral: UserAssetCollateral[]
}

export interface UserAssetCollateral {
    /// Asset denom
    denom: string
    /// Either denom if native asset or contract address if cw20
    asset_label: string
    /// Wether the user is using asset as collateral or not
    enabled: boolean
}

export interface RedBankState {
    assetLiquidity: Coin[] | undefined
    marketInfo: MarketQuery[] | undefined
    marketIncentiveInfo: MarketIncentiveQuery[] | undefined
    state: State
    findLiquidity: (key: Denom) => Coin | undefined
    findMarketInfo: (key: Denom) => MarketQuery | undefined
    findMarketIncentiveInfo: (key: Denom) => MarketIncentiveQuery | undefined
    findMarketTotalLiquidity: (key: Denom) => Coin
    findUserAssetCollateral: (key: Denom) => UserAssetCollateral | undefined
    refetch: () => void
}

export const [useRedBank, RedBankProvider] =
    createContext<RedBankState>('useRedBank')

export const useRedBankState = (
    redBankContractAddress: string | undefined,
    incentivesContractAddress: string | undefined,
    address: string
): RedBankState => {
    const [assetLiquidity, setAssetLiquidity] = useState<Coin[] | undefined>()
    const [state, setState] = useState(State.INITIALISING)
    const [marketInfo, setMarketInfo] = useState<MarketQuery[] | undefined>()
    const [marketIncentiveInfo, setMarketIncentiveInfo] = useState<
        MarketIncentiveQuery[] | undefined
    >()
    const [marketMaTokenInfo, setMarketMaTokenInfo] = useState<
        MarketMaTokenQuery[] | undefined
    >()
    const [userCollateral, setUserCollateral] = useState<
        UserCollateral | undefined
    >()
    const [fetchedData, setFetchedData] = useState<Object>()
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const networkAddresses = useStore((s) => s.networkAddresses)

    const {
        data,
        loading,
        error,
        refetch: refetchQuery,
    } = useQuery(
        gql`
            ${redbankQuery(
                address || '',
                redBankContractAddress || '',
                incentivesContractAddress || '',
                whitelistedAssets,
                networkAddresses
            )}
        `,
        {
            fetchPolicy: 'network-only',
            pollInterval: 30000,
            nextFetchPolicy: 'no-cache',
            skip:
                !redBankContractAddress ||
                !incentivesContractAddress ||
                !whitelistedAssets?.length ||
                !networkAddresses,
        }
    )

    if (error && state !== State.ERROR && !data) {
        setState(State.ERROR)
    }

    if (data && data !== fetchedData && !loading && !error) {
        setFetchedData(data)
        const rawBalances: Coin[] = data.balance.balance
        const newCoins: Coin[] = rawBalances.map(
            (coin) => new Coin(coin.denom, coin.amount)
        )
        const marketInfos: MarketQuery[] = []
        const marketIncentiveInfos: MarketIncentiveQuery[] = []
        const marketMaTokenInfos: MarketMaTokenQuery[] = []

        whitelistedAssets?.forEach((asset: WhitelistAsset) => {
            const denom = asset.denom
            const queryResult = data[REDBANK_WASM_KEY]
            if (asset.contract_addr) {
                const newCoin: Coin = new Coin(
                    denom,
                    queryResult[denom]?.balance || 0
                )
                newCoins.push(newCoin)
            }

            // parse market query
            const marketData: MarketQuery = {
                ...queryResult[`${denom}Market`],
                denom: denom,
            }
            marketInfos.push(marketData)

            const marketIncentiveData: MarketIncentiveQuery = {
                ...queryResult[`${denom}MarketIncentive`],
                denom: denom,
            }
            marketIncentiveInfos.push(marketIncentiveData)

            const marketMaTokenData: MarketMaTokenQuery = {
                ...queryResult[`${denom}MarketMaToken`],
                denom: denom,
            }
            marketMaTokenData.denom = denom
            marketMaTokenInfos.push(marketMaTokenData)
        })
        setAssetLiquidity(newCoins)
        setMarketInfo(marketInfos)
        setMarketIncentiveInfo(marketIncentiveInfos)
        setMarketMaTokenInfo(marketMaTokenInfos)
        setUserCollateral(data[REDBANK_WASM_KEY][USER_COLLATERAL_WASM_KEY])
        setState(State.READY)
    }

    const findLiquidity = (denom: Denom) =>
        assetLiquidity && assetLiquidity.find((coin) => coin.denom === denom)

    const findMarketInfo = (denom: Denom) =>
        marketInfo && marketInfo.find((info) => info.denom === denom)

    const findMarketIncentiveInfo = (denom: Denom) =>
        marketIncentiveInfo &&
        marketIncentiveInfo.find((info) => info.denom === denom)

    const findMarketTotalLiquidity = (denom: Denom): Coin => {
        const maTokenTotalSupply =
            (marketMaTokenInfo &&
                marketMaTokenInfo.find((info) => info.denom === denom)
                    ?.total_supply) ||
            0
        const marketInfo = findMarketInfo(denom)

        // Mars contracts scale/multiply everything by 1e6 to add accuracy, so we need to do the opposite here and divide by 1e6
        const scaledAmount =
            (Number(maTokenTotalSupply) / 1e6) *
            (marketInfo?.liquidity_index || 1)
        return new Coin(denom || '', scaledAmount)
    }

    const findUserAssetCollateral = (denom: Denom) =>
        userCollateral?.collateral &&
        userCollateral.collateral.find(
            (userAssetCollateral) => userAssetCollateral.denom === denom
        )

    const refetch = () => refetchQuery()

    return {
        assetLiquidity,
        marketInfo,
        marketIncentiveInfo,
        state,
        findLiquidity,
        findMarketInfo,
        findMarketIncentiveInfo,
        findMarketTotalLiquidity,
        findUserAssetCollateral,
        refetch,
    }
}
