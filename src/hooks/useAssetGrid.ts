import { Coin } from '@terra-money/terra.js'
import { useEffect, useState } from 'react'
import { MARS_DENOM, UST_DECIMALS, UST_DENOM } from '../constants/appConstants'
import { lookup, lookupDecimals } from '../libs/parse'
import useStore from '../store'
import { State } from '../types/enums'
import createContext from './createContext'
import { AccountBalance } from './useAccountBalance'
import { ExchangeRates } from './useExchangeRate'
import { MarketIncentiveQuery, RedBankState } from './useRedBank'

export interface AssetGrid {
    supplyMarketsGridData: AssetInfo[]
    borrowMarketsGridData: AssetInfo[]
}

export const [useAssetGrid, AssetGridProvider] =
    createContext<AssetGrid>('useAssetGrid')

export const useAssetGridState = (
    accountBalanceHook: AccountBalance,
    redbankHook: RedBankState,
    exchangeHook: ExchangeRates
): AssetGrid => {
    const [supplyMarketsGridData, setSupplyData] = useState<AssetInfo[]>([])
    const [borrowMarketsGridData, setBorrowData] = useState<AssetInfo[]>([])
    const [marsAsset, setMarsAsset] = useState<WhitelistAsset>()
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const name = useStore((s) => s.networkConfig?.name)
    const setIsNetworkSupported = useStore((s) => s.setIsNetworkSupported)

    useEffect(() => {
        const getMarsAssetInfo = async () => {
            try {
                const assets = await import(`../configs/assets/${name}.ts`)
                setMarsAsset(assets.default.mars)
            } catch {
                setIsNetworkSupported(false)
            }
        }
        getMarsAssetInfo()
    }, [name, setIsNetworkSupported])

    const calculateIncentiveAssetInfo = (
        incentive: MarketIncentiveQuery | undefined,
        marketTotalLiquidity: Coin | undefined
    ): AssetInfo | undefined => {
        if (
            !incentive?.asset_incentive ||
            !marketTotalLiquidity ||
            !whitelistedAssets
        )
            return

        const secondsInAYear = 31540000
        const anualEmission =
            Number(incentive.asset_incentive.emission_per_second) *
            secondsInAYear
        const anualEmissionUSTVaule = exchangeHook.exchangeToUusd(
            new Coin(MARS_DENOM, anualEmission)
        )
        const liquidityUSTValue =
            exchangeHook.exchangeToUusd(marketTotalLiquidity)
        const incentiveApr = anualEmissionUSTVaule / liquidityUSTValue

        return {
            denom: MARS_DENOM,
            decimals: lookupDecimals(MARS_DENOM, whitelistedAssets),
            symbol: marsAsset?.symbol || 'MARS',
            color: marsAsset?.color || '#ea2941',
            apy: incentiveApr * 100,
        }
    }

    useEffect(
        () => {
            if (
                exchangeHook.state !== State.READY ||
                accountBalanceHook.state !== State.READY ||
                redbankHook.state !== State.READY
            )
                return
            let supplyData: AssetInfo[] = []
            let borrowData: AssetInfo[] = []
            if (!whitelistedAssets?.length) return
            whitelistedAssets.forEach((asset) => {
                const assetWallet = accountBalanceHook.find(asset.denom)
                const uusdWallet = exchangeHook.exchangeToUusd(assetWallet)
                const supplyAssetBalance = accountBalanceHook.findDeposit(
                    asset.denom
                )
                const borrowAssetBalance = accountBalanceHook.findDebt(
                    asset.denom
                )
                const reserveInfo = redbankHook.findMarketInfo(asset.denom)
                const depositApy = reserveInfo?.liquidity_rate || 0
                const liquidity = redbankHook.findLiquidity(asset.denom)
                const incentive = calculateIncentiveAssetInfo(
                    redbankHook.findMarketIncentiveInfo(asset.denom),
                    redbankHook.findMarketTotalLiquidity(asset.denom)
                )

                const supplyAssetBalanceUusd = lookup(
                    exchangeHook.exchangeToUusd(supplyAssetBalance),
                    UST_DENOM,
                    UST_DECIMALS
                )
                const combinedDepositApy =
                    Number(depositApy) + Number(incentive?.apy || 0) / 100
                const dlyIncome = incentive
                    ? (supplyAssetBalanceUusd * combinedDepositApy) / 365
                    : (supplyAssetBalanceUusd * combinedDepositApy) / 365

                const borrowApy = reserveInfo?.borrow_rate || 0
                const dlyExpense =
                    (lookup(
                        exchangeHook.exchangeToUusd(borrowAssetBalance),
                        UST_DENOM,
                        UST_DECIMALS
                    ) *
                        borrowApy) /
                    365
                supplyData.push({
                    ...asset,
                    wallet: assetWallet?.amount.toString(),
                    uusdWallet,
                    balance: supplyAssetBalance?.amount.toString(),
                    uusdBalance:
                        exchangeHook.exchangeToUusd(supplyAssetBalance) >= 1000
                            ? exchangeHook.exchangeToUusd(supplyAssetBalance)
                            : 0,
                    apy: depositApy * 100 >= 0.01 ? depositApy * 100 : 0.0,
                    incomeOrExpense: Number(dlyIncome.toFixed(2)) || 0,
                    incentive,
                })

                borrowData.push({
                    ...asset,
                    wallet: assetWallet?.amount.toString(),
                    uusdWallet,
                    balance: borrowAssetBalance?.amount.toString(),
                    uusdBalance:
                        exchangeHook.exchangeToUusd(borrowAssetBalance) >= 1000
                            ? exchangeHook.exchangeToUusd(borrowAssetBalance)
                            : 0,
                    apy: borrowApy * 100 >= 0.01 ? borrowApy * 100 : 0.0,
                    incomeOrExpense: Number(dlyExpense.toFixed(2)) || 0,
                    liquidity: liquidity?.amount.toString(),
                    uusdLiquidity: exchangeHook.exchangeToUusd(liquidity),
                })
            })

            setSupplyData(supplyData)
            setBorrowData(borrowData)
        },
        // eslint-disable-next-line
        [
            exchangeHook.state,
            exchangeHook.uusdExchangeRates,
            redbankHook.state,
            redbankHook.assetLiquidity,
            redbankHook.marketInfo,
            redbankHook.marketIncentiveInfo,
            accountBalanceHook.state,
            accountBalanceHook.coins,
            accountBalanceHook.debts,
            accountBalanceHook.deposits,
            whitelistedAssets,
            marsAsset,
        ]
    )

    return { supplyMarketsGridData, borrowMarketsGridData }
}
