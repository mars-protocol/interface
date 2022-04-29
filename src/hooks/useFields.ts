import { useState, useEffect } from 'react'
import { Coin } from '@terra-money/terra.js'

import { useExchangeRate } from './useExchangeRate'
import { contractQuery } from '../queries/contractQuery'
import { configQuery } from '../queries/configQuery'
import { stateQuery } from '../queries/stateQuery'
import { debtQuery } from '../queries/debtQuery'
import { gql, useQuery } from '@apollo/client'
import { useAddressProvider, useRedBank } from '.'
import { deposit } from '../queries/astroDepositQuery'
import {
    uncollaterisedLoanLimitQuery,
    uncollaterisedNativeLoanLimitQuery,
} from '../queries/uncollateralisedLoanLimitQuery'
import createContext from './createContext'
import useStore from '../store'
import { convertAprToApy } from '../libs/parse'

interface QueryObject {
    standardQuery: string
    apyQuery: StrategyApyQuery | undefined
}

interface AstroPoolQueryResponse {
    trading_fees: {
        apr: number
        apy: number
    }
    astro_rewards: {
        apy: number
        apr: number
    }
    protocol_rewards: {
        apy: number
        apr: number
    }
    total_rewards: {
        apy: number
        apr: number
    }
}

const produceQuery = (queryType: string, userAddress: string) => {
    return `{ 
               ${queryType}: {
                    user: "${userAddress}"
                }
            }`
}

const poolQuery = () => {
    return `{pool: { }}`
}

export const [useFields, FieldsProvider] =
    createContext<FieldsState>('useFields')

export const useFieldsState = (): FieldsState => {
    const fieldsStrategies = useStore((s) => s.fieldsStrategies)
    const isNetworkLoaded = useStore((s) => s.isNetworkLoaded)
    const { exchangeToUusd } = useExchangeRate()
    const { findMarketInfo } = useRedBank()
    const addresses = useAddressProvider()
    const [strategies, setStrategies] = useState<StrategyObject[] | undefined>()
    const [initQuery, setInitQuery] = useState<String>('{ping}') // placeholder
    const [apyLoaded, setApyLoaded] = useState(false)
    const [queriesReady, setQueriesReady] = useState(false)
    const [apyLoadingError, setApyLoadingError] = useState(false)
    const [netWorth, setNetWorth] = useState(0)
    const userWalletAddress = useStore((s) => s.userWalletAddress)
    const CONFIG = 'config'
    const STATE = 'state'
    const POSITION = 'position'
    const HEALTH = 'health'
    const POOL = 'pool'
    const SNAPSHOT = 'snapshot'
    const LP_DEPOSIT = 'lpdeposit'
    const UNCOLLATERISEDLOANLIMIT = 'uncollaterisedLoanLimit'
    const STRATEGY_CURRENT_DEBT = 'strategyTotalDebt'
    const dailyCompoundingPeriod = 365 // dailyCompounding

    // build the request
    const buildRequest = (): QueryObject[] => {
        if (
            !isNetworkLoaded ||
            !fieldsStrategies?.length ||
            !addresses.config?.red_bank_address
        )
            return []
        const queries: QueryObject[] = fieldsStrategies?.map(
            (strategy: FieldsStrategy) => {
                // build apy query for astroport
                const apyQuery = strategy.apyQuery
                let standardQuery =
                    contractQuery(
                        `${strategy.key}${CONFIG}`,
                        strategy.contract_addr,
                        configQuery()
                    ) +
                    contractQuery(
                        `${strategy.key}${STATE}`,
                        strategy.contract_addr,
                        stateQuery()
                    ) +
                    contractQuery(
                        `${strategy.key}${POSITION}`,
                        strategy.contract_addr,
                        produceQuery(POSITION, userWalletAddress)
                    ) +
                    contractQuery(
                        `${strategy.key}${SNAPSHOT}`,
                        strategy.contract_addr,
                        produceQuery(SNAPSHOT, userWalletAddress)
                    ) +
                    contractQuery(
                        `${strategy.key}${HEALTH}`,
                        strategy.contract_addr,
                        produceQuery(HEALTH, userWalletAddress)
                    ) +
                    contractQuery(
                        `${strategy.key}${POOL}`,
                        strategy.minter,
                        poolQuery()
                    ) +
                    contractQuery(
                        `${strategy.key}${LP_DEPOSIT}`,
                        strategy.astroportGenerator,
                        deposit(strategy.contract_addr, strategy.lpToken)
                    ) +
                    contractQuery(
                        `${strategy.key}${UNCOLLATERISEDLOANLIMIT}`,
                        addresses.config?.red_bank_address!,
                        strategy.borrow === 'UST' || strategy.borrow === 'LUNA'
                            ? uncollaterisedNativeLoanLimitQuery(
                                  strategy.contract_addr,
                                  getBorrowDenomFromStrategy(strategy)
                              )
                            : uncollaterisedLoanLimitQuery(
                                  strategy.contract_addr,
                                  getBorrowDenomFromStrategy(strategy)
                              )
                    ) +
                    contractQuery(
                        `${strategy.key}${STRATEGY_CURRENT_DEBT}`,
                        addresses.config?.red_bank_address!,
                        debtQuery(strategy.contract_addr)
                    )

                const result: QueryObject = { standardQuery, apyQuery }
                return result
            }
        )

        return queries
    }

    const getBorrowDenomFromStrategy = (strategy: FieldsStrategy): string => {
        const borrowSymbol = strategy.borrow
        const asset = strategy.assets.find(
            (asset) => asset.symbol === borrowSymbol
        )!
        return asset.denom
    }

    const defaultRates = {
        trading: 0,
        astro: 0,
        protocol: 0,
        total: 0,
        leverage: 0,
    }
    const queryList = buildRequest()

    const getAprs = (poolDetails: AstroPoolQueryResponse) => {
        const tradingFeesApy = Number(poolDetails.trading_fees.apy)
        const astroRewardsApr = Number(poolDetails.astro_rewards.apr)
        const protocolRewardsApr = Number(poolDetails.protocol_rewards.apr)
        const totalRewardsApr =
            tradingFeesApy + astroRewardsApr + protocolRewardsApr
        return {
            tradingFeesApr: tradingFeesApy,
            astroRewardsApr,
            protocolRewardsApr,
            totalRewardsApr,
        }
    }

    const produceApy = (poolDetails: AstroPoolQueryResponse): StrategyRate => {
        const { tradingFeesApr, protocolRewardsApr, astroRewardsApr } =
            getAprs(poolDetails)

        return poolDetails !== null
            ? {
                  trading: poolDetails.trading_fees.apy * 100 || 0,
                  astro: poolDetails.astro_rewards.apy * 100 || 0,
                  protocol: poolDetails.protocol_rewards.apy * 100 || 0,
                  total:
                      tradingFeesApr * 100 +
                      convertAprToApy(
                          (protocolRewardsApr + astroRewardsApr) * 100 || 0,
                          dailyCompoundingPeriod
                      ),
                  leverage: 0,
              }
            : defaultRates
    }

    const produceApr = (poolDetails: AstroPoolQueryResponse): StrategyRate => {
        const {
            totalRewardsApr,
            tradingFeesApr,
            astroRewardsApr,
            protocolRewardsApr,
        } = getAprs(poolDetails)
        return poolDetails !== null
            ? {
                  trading: tradingFeesApr * 100 || 0,
                  astro: astroRewardsApr * 100 || 0,
                  protocol: protocolRewardsApr * 100 || 0,
                  total: totalRewardsApr * 100 || 0,
                  leverage: 0,
              }
            : defaultRates
    }

    const handleAstroGraphError = () => {
        // We wait for the apy loading attempt (which comes from astroport graph) before attempting to build our strategy details
        // If this request fails (perhaps astroport graph is down) we still want to be able to use the app
        setApyLoaded(true)
        setApyLoadingError(true)
        console.error(
            'error loading from astroport graph, continuing without apy'
        )
    }

    const fetchApy = async (query: string) => {
        fetch('https://api.astroport.fi/graphql', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: null,
            }),
            method: 'POST',
        })
            .then((response) => {
                if (!response.ok) {
                    // if this network request fails, we want to continue loading the application anyway so that users can
                    // still edit their positions
                    handleAstroGraphError()
                }
                response.json().then((data) => {
                    fieldsStrategies?.map((strategy: FieldsStrategy) => {
                        strategy.apy = produceApy(data.data[`${strategy.key}`])
                        strategy.apr = produceApr(data.data[`${strategy.key}`])

                        return strategy
                    })
                    setApyLoadingError(false)
                    setApyLoaded(true)
                })
            })
            .catch(() => {
                handleAstroGraphError()
            })
    }

    const { data, error, refetch, loading } = useQuery(
        gql`
            ${initQuery}
        `,
        {
            fetchPolicy: 'no-cache',
            notifyOnNetworkStatusChange: true,
            pollInterval: 60000,
            errorPolicy: 'ignore',
            skip:
                !isNetworkLoaded || !fieldsStrategies?.length || !queriesReady,
        }
    )

    if (error) {
        console.error(error)
    }

    const getStrategyObject = (
        results: any,
        strategy: FieldsStrategy,
        strategySnapshot: StrategySnapshot
    ): StrategyObject => {
        const strategyObject = {
            position: results[`${strategy.key}${POSITION}`],
            health: results[`${strategy.key}${HEALTH}`],
            snapshot: results[`${strategy.key}${SNAPSHOT}`],
            pool_info: results[`${strategy.key}${POOL}`],
            minter_address: strategy.minter,
            primarySupplyRatio: undefined,
            secondarySupplyRatio: undefined,
            ...strategy,
            ...results[`${strategy.key}${HEALTH}`],
            ...results[`${strategy.key}${CONFIG}`],
            ...results[`${strategy.key}${STATE}`],
            uncollaterisedLoanLimit: Number(
                results[`${strategy.key}${UNCOLLATERISEDLOANLIMIT}`]
            ),
            strategyTotalDebt: results[
                `${strategy.key}${STRATEGY_CURRENT_DEBT}`
            ].debts.find(
                (asset: AssetInfo) => asset.denom === strategy.assets[1].denom
            ).amount,
        }

        const primaryIsNative = strategyObject.primary_asset_info.native
        const primaryPoolIndex = primaryIsNative
            ? strategyObject.pool_info?.assets[0].info.native_token?.denom ===
              strategyObject.primary_asset_info.native
                ? 0
                : 1
            : strategyObject.pool_info.assets[0].info.token?.contract_addr ===
              strategyObject.primary_asset_info.cw20
            ? 0
            : 1
        const secondaryPoolIndex = primaryPoolIndex === 0 ? 1 : 0
        strategyObject.bondedShares = results[`${strategy.key}${LP_DEPOSIT}`]
        strategyObject.primaryAssetIndex = primaryPoolIndex
        strategyObject.secondaryAssetIndex = secondaryPoolIndex

        const primarySupplyRatio =
            Number(
                strategyObject.pool_info?.assets[primaryPoolIndex].amount || 1
            ) / Number(strategyObject.pool_info?.total_share || 1)
        const secondarySupplyRatio =
            Number(
                strategyObject.pool_info?.assets[secondaryPoolIndex].amount || 1
            ) / Number(strategyObject.pool_info?.total_share || 1)

        strategyObject.primarySupplyRatio = primarySupplyRatio
        strategyObject.secondarySupplyRatio = secondarySupplyRatio
        return strategyObject
    }

    const calculateUnlock = (
        bondUnitsToUnlock: number,
        strategy: StrategyObject
    ): UnlockedAssets => {
        const primaryDepth = Number(
            strategy?.pool_info?.assets[strategy.primaryAssetIndex].amount
        )
        const secondaryDepth =
            strategy?.pool_info?.assets[
                strategy.primaryAssetIndex === 0 ? 1 : 0
            ].amount
        const totalShares = Number(strategy?.pool_info?.total_share)

        const usersBondedShares = Math.floor(
            (Number(strategy?.bondedShares) * Number(bondUnitsToUnlock)) /
                Number(strategy?.total_bond_units)
        )

        const primaryUnlocked = Math.floor(
            (primaryDepth * usersBondedShares) / totalShares
        )

        const secondaryUnlocked: number = Math.floor(
            (Number(secondaryDepth) * usersBondedShares) / totalShares
        )

        return {
            primaryAssetUnlocked: primaryUnlocked,
            secondaryAssetUnlocked: secondaryUnlocked,
        }
    }

    const processData = () => {
        const results = data?.useFieldsWasm
        let netWorthValue = 0
        if (!results) return
        const newStrategies = fieldsStrategies?.map(
            (strategy: FieldsStrategy) => {
                let strategySnapshot = {
                    height: '0',
                    time: '0',
                    position: {
                        bond_units: '0',
                        debt_units: '0',
                    },
                    health: {
                        bond_value: '0',
                        debt_value: '0',
                        ltv: '0',
                    },
                }
                // get the indexes of the assets
                const strategyObject = getStrategyObject(
                    results,
                    strategy,
                    strategySnapshot
                )

                // MATH SECTION
                if (strategyObject.position) {
                    const position = {
                        bond_units: strategyObject.position?.bond_units ?? '0',
                        debt_units: strategyObject.position?.debt_units ?? '0',
                        apy: 0,
                        poolApr: 0,
                        trueApy: 0,
                        net_worth: 0,
                        pnl: 0,
                        leverage: 0,
                        liquidation_price: 0,
                        daily_return: 0,
                        primarySupplyUnits: 0,
                        primarySupplyRate: 0,
                        secondarySupplyUnits: 0,
                        secondarySupplyRate: 0,
                        denom: 'uusd',
                        decimals: 6,
                        primaryAssetAvailable: 0,
                        secondaryAssetAvailable: 0,
                    }
                    const health = {
                        bond_value: strategyObject.health?.bond_value ?? '0',
                        debt_value: strategyObject.health?.debt_value ?? '0',
                        ltv: strategyObject.health?.ltv ?? '0',
                    }

                    const { apy, apr } =
                        !apyLoadingError && strategyObject
                            ? {
                                  apy: Number(strategyObject.apy?.total),
                                  apr: Number(strategyObject.apr?.total),
                              }
                            : { apy: 0, apr: 0 }

                    const primaryPrice =
                        Number(strategyObject?.secondarySupplyRatio || 1) /
                        Number(strategyObject?.primarySupplyRatio || 1)

                    const secondaryAsset = strategy.assets[1]
                    const secondaryPrice =
                        secondaryAsset?.denom === 'uusd'
                            ? 1
                            : exchangeToUusd(
                                  new Coin(
                                      secondaryAsset?.denom || '',
                                      1 || '0'
                                  )
                              )

                    const { primaryAssetUnlocked, secondaryAssetUnlocked } =
                        calculateUnlock(
                            Number(strategyObject.position.bond_units),
                            strategyObject
                        )

                    const primaryValue = primaryPrice * primaryAssetUnlocked
                    const secondaryValue =
                        secondaryAssetUnlocked * secondaryPrice

                    const totalValue = primaryValue + secondaryValue

                    // debt value it's fine to use contract value
                    const debtValue = Number(strategyObject.health?.debt_value)
                    const leverage =
                        1 + debtValue / (totalValue - debtValue) || 1
                    const netWorth = totalValue - debtValue
                    const currentLtv =
                        Number(strategyObject.health?.debt_value) /
                        Number(totalValue)

                    // contract uses oracle, so replace contract values with our own
                    health.ltv = currentLtv.toString()
                    const liquidationPrice = Number(
                        primaryPrice *
                            Math.pow(
                                currentLtv /
                                    Number(strategyObject?.max_ltv || 0),
                                2
                            ) || 0
                    )

                    const snapShotBondValue =
                        strategyObject.snapshot?.health.bond_value || '0'
                    const snapShotDebtValue =
                        strategyObject.snapshot?.health.debt_value || '0'

                    // bond value of our position according to the mars oracle, not the underlying pool
                    const oraclePositionBondValue = Number(
                        strategyObject.health?.bond_value
                    )

                    const pnl =
                        oraclePositionBondValue -
                        Number(health.debt_value) -
                        (Number(snapShotBondValue) - Number(snapShotDebtValue))

                    const borrowApr =
                        Number(findMarketInfo('uusd')?.borrow_rate) * 100

                    // temp fix for apy issues.
                    const trueApy = apy * leverage
                    // const trueApy = calculateStrategyRate(
                    //     leverage,
                    //     apr / 100,
                    //     borrowApr / 100,
                    //     totalValue,
                    //     debtValue,
                    //     dailyCompoundingPeriod
                    // )

                    position.trueApy = trueApy
                    const dailyReturn =
                        (totalValue * (apr / 100) -
                            debtValue * (borrowApr / 100)) /
                        dailyCompoundingPeriod
                    position.pnl = pnl
                    position.poolApr = apr
                    position.apy = apy
                    // override the bond value from the contract
                    health.bond_value = totalValue.toFixed(0)
                    position.primaryAssetAvailable = primaryAssetUnlocked
                    position.secondaryAssetAvailable = secondaryAssetUnlocked
                    position.leverage =
                        leverage === 1 || leverage === 2
                            ? leverage
                            : Number(leverage)
                    position.liquidation_price = liquidationPrice
                    position.net_worth = netWorth
                    position.denom = strategy.assets[1].denom
                    position.daily_return = dailyReturn
                    position.debt_units =
                        strategyObject.position?.debt_units || '0'
                    position.primarySupplyRate =
                        strategyObject.primarySupplyRatio || 0
                    position.secondarySupplyRate =
                        strategyObject.secondarySupplyRatio || 0
                    strategyObject.position = position
                    strategyObject.health = health
                    netWorthValue += netWorth || 0
                }

                return strategyObject
            }
        )

        setNetWorth(netWorthValue)
        return newStrategies
    }

    useEffect(() => {
        if (queryList.length === 0) return

        if (!apyLoaded) {
            fetchApy(
                `query {${queryList.map(
                    (queryObject: QueryObject) => queryObject.apyQuery?.query
                )}}`
            )
        }

        setInitQuery(`query UseFieldsQuery { useFieldsWasm: wasm { 
            ${queryList.map(
                (queryObject: QueryObject) => queryObject.standardQuery
            )}}}`)

        setQueriesReady(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryList])

    useEffect(() => {
        if (!loading && data && apyLoaded) setStrategies(processData())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, loading, apyLoaded])

    return {
        refetch,
        netWorth,
        strategies,
        calculateUnlock,
    }
}
