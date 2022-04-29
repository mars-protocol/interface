import { useState, useEffect } from 'react'

import styles from './MyStation.module.scss'
import Card from '../../components/card/Card'
import Portfolio from './layouts/Portfolio'

import Markets from './layouts/Markets'
import RedbankAction from '../../layouts/txmodal/RedbankAction'

import {
    useAccountBalance,
    useRedBank,
    useExchangeRate,
    useStaking,
    useMarsBalance,
    useAssetGrid,
} from '../../hooks'
import { useFieldsState } from '../../hooks/useFields'
import { useMyLockupGridState } from '../../hooks/lockdrop/useMyLockupGrid'
import {
    ltvWeightedDepositValue,
    maintainanceMarginWeightedDepositValue,
} from '../../libs/assetInfo'
import { formatValue, lookup, magnify } from '../../libs/parse'
import Tooltip from '../../components/tooltip/Tooltip'

import {
    supplyGridColumns,
    supplyGridInitialState,
    borrowGridColumns,
    borrowGridInitialState,
    myLockdropGridColumns,
    myLockdropGridInitialState,
} from './gridConfig'
import BalanceCard from './components/BalanceCard'
import { Coin } from '@terra-money/terra.js'
import TitleSeparator from './components/TitleSeparator'
import FieldsOfMarsOverview from './layouts/FieldsOfMarsOverview'
import Strategies from '../fields/layouts/Strategies'
import {
    activeStrategyGridColumns,
    activeStrategyGridInitialState,
} from '../fields/gridConfig'
import { Trans, useTranslation } from 'react-i18next'
import { Route, Switch } from 'react-router-dom'
import { ViewType } from '../../types/enums'
import {
    FIELDS_FEATURE,
    MARS_DECIMALS,
    MARS_DENOM,
    MY_LOCKDROP_FEATURE,
    UST_DECIMALS,
    UST_DENOM,
    XMARS_DECIMALS,
    XMARS_DENOM,
} from '../../constants/appConstants'
import MyLockdrop from './layouts/MyLockdrop'
import LockdropAction from './layouts/LockdropAction'
import Tippy from '@tippyjs/react'
import CollectionHover, { HoverItem } from '../../components/CollectionHover'
import useStore from '../../store'

const MyStation = () => {
    // --------------------
    // STATES
    // --------------------
    const { findDebt, findDeposit } = useAccountBalance()
    const { apy, xMarsRatio } = useStaking()
    const { find } = useAccountBalance()
    const { t } = useTranslation()
    const { findBalance } = useMarsBalance()
    const { findMarketInfo, findUserAssetCollateral } = useRedBank()
    const { exchangeToUusd } = useExchangeRate()
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const { strategies, netWorth } = useFieldsState()
    const { lockdropPositions } = useMyLockupGridState()

    const [showDetailsRedbank, setShowDetailsRedbank] = useState<boolean>(false)
    const [showDetailsFields, setShowDetailsFields] = useState<boolean>(false)
    const [activeStrategiesData, setActiveStrategiesData] = useState<
        StrategyObject[]
    >([])
    const [loaded, setLoaded] = useState(false)
    const { supplyMarketsGridData, borrowMarketsGridData } = useAssetGrid()

    // -------------------
    // CALCULATE
    // -------------------
    // init asset list
    useEffect(
        () => {
            if (strategies?.length) {
                const newActive: StrategyObject[] = []
                const newAvailable: StrategyObject[] = []
                const newNotInWallet: StrategyObject[] = []
                strategies?.forEach((strategy: StrategyObject) => {
                    strategy.description = t(
                        `strategy.${strategy.key}Description`
                    )
                    strategy.name = t(`strategy.${strategy.key}`)
                    if (Number(strategy.position?.bond_units) > 0) {
                        newActive.push(strategy)
                    } else {
                        const assetWallet = find(strategy.assets[0].denom)
                        if (assetWallet?.amount.toString() !== '0') {
                            newAvailable.push(strategy)
                        } else {
                            newNotInWallet.push(strategy)
                        }
                    }
                })
                setLoaded(true)
                setActiveStrategiesData(newActive)
            } else {
                setLoaded(true)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            strategies,
            findDeposit,
            findDebt,
            findMarketInfo,
            exchangeToUusd,
            whitelistedAssets,
        ]
    )

    const borrowBalance =
        lookup(
            borrowMarketsGridData.reduce(
                (total, currentAsset) =>
                    total +
                    exchangeToUusd(
                        new Coin(
                            currentAsset.denom || '',
                            currentAsset.balance || '0'
                        )
                    ),
                0
            ),
            UST_DENOM,
            UST_DECIMALS
        ) || 0
    const supplyBalance =
        lookup(
            supplyMarketsGridData.reduce(
                (total, currentAsset) =>
                    total +
                    exchangeToUusd(
                        new Coin(
                            currentAsset.denom || '',
                            currentAsset.balance || '0'
                        )
                    ),
                0
            ),
            UST_DENOM,
            UST_DECIMALS
        ) || 0

    const xMarsBalance = Number(findBalance(XMARS_DENOM)?.amount)
    const marsBalance = xMarsBalance * xMarsRatio
    const marsValue = exchangeToUusd(new Coin(MARS_DENOM, marsBalance))

    const totalNetworth =
        (supplyBalance || 0) -
        (borrowBalance || 0) +
        lookup(marsValue || 0, MARS_DENOM, MARS_DECIMALS) +
        lookup(netWorth || 0, UST_DENOM, UST_DECIMALS)

    const maxBorrowLimit = ltvWeightedDepositValue(
        supplyMarketsGridData,
        findMarketInfo,
        findUserAssetCollateral
    )
    const dustLimit = (denom?: string) =>
        !denom || denom === 'uusd' ? 500 : 5000
    const depositsActiveDataFilter = (asset: AssetInfo) =>
        Number(asset.balance) > dustLimit(asset.denom)
    const borrowedActiveDataFilter = (asset: AssetInfo) =>
        Number(asset.balance) > dustLimit(asset.denom)

    // ---------------------
    // CALLBACKS
    // ---------------------
    const showDetailsRedbankClickHandler = () => {
        setShowDetailsRedbank(!showDetailsRedbank)
    }

    // ---------------------
    // PRESENTATION
    // ---------------------

    const networthData: HoverItem[] = []

    if (supplyBalance || borrowBalance) {
        networthData.push({
            name: t('global.redBank'),
            usdValue: (supplyBalance || 0) - (borrowBalance || 0),
            negative: (supplyBalance || 0) - (borrowBalance || 0) < 0,
        })
    }

    if (netWorth) {
        networthData.push({
            name: t('global.fields'),
            usdValue: lookup(netWorth || 0, UST_DENOM, UST_DECIMALS),
        })
    }

    if (marsValue) {
        networthData.push({
            name: t('global.council'),
            usdValue: lookup(marsValue || 0, MARS_DENOM, MARS_DECIMALS),
        })
    }

    const maxLtvAmount = ltvWeightedDepositValue(
        supplyMarketsGridData,
        findMarketInfo,
        findUserAssetCollateral
    )
    const liquidationThreshold = maintainanceMarginWeightedDepositValue(
        supplyMarketsGridData,
        findMarketInfo,
        findUserAssetCollateral
    )

    const ltv =
        (Number(magnify(borrowBalance, UST_DECIMALS)) / liquidationThreshold) *
        100

    const maxLtvPercent = (maxLtvAmount / liquidationThreshold) * 100

    return (
        <div className={styles.mystation}>
            <Switch>
                <Route exact={true} path='/mystation'>
                    <>
                        <div className={styles.overviewContainer}>
                            <Card>
                                <div className={styles.overview}>
                                    <div className={styles.tooltip}>
                                        <Tooltip
                                            content={t(
                                                'mystation.myStationOverviewTooltip'
                                            )}
                                            iconWidth={'18px'}
                                        />
                                    </div>
                                    <span className={`h6 ${styles.title}`}>
                                        {t('common.overview')}
                                    </span>
                                    <div className={styles.overviewDetails}>
                                        {networthData.length ? (
                                            <Tippy
                                                content={
                                                    <CollectionHover
                                                        title={t(
                                                            'mystation.myNetWorthBreakdown'
                                                        )}
                                                        data={networthData}
                                                        noPercent={true}
                                                    />
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.detailsItem
                                                    }
                                                >
                                                    <BalanceCard
                                                        title={t(
                                                            'mystation.myNetWorthOnMars'
                                                        )}
                                                        value={totalNetworth}
                                                        prefix={'$'}
                                                        suffix={''}
                                                    />
                                                </div>
                                            </Tippy>
                                        ) : (
                                            <div className={styles.detailsItem}>
                                                <BalanceCard
                                                    title={t(
                                                        'mystation.myNetWorthOnMars'
                                                    )}
                                                    value={totalNetworth}
                                                    prefix={'$'}
                                                    suffix={''}
                                                />
                                            </div>
                                        )}
                                        <div className={styles.detailsItem}>
                                            <BalanceCard
                                                title={'xMARS'}
                                                value={lookup(
                                                    xMarsBalance,
                                                    XMARS_DENOM,
                                                    XMARS_DECIMALS
                                                )}
                                                prefix={''}
                                                suffix={''}
                                                style={{
                                                    alignItems: 'center',
                                                }}
                                            />
                                        </div>
                                        <div className={styles.detailsItem}>
                                            <BalanceCard
                                                title={t('council.apyXmars')}
                                                value={apy}
                                                prefix={''}
                                                suffix={'%'}
                                                style={{
                                                    alignItems: 'flex-end',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <TitleSeparator title={t('global.redBank')} />
                        <div className={styles.summaryContainer}>
                            <Card>
                                <div className={styles.summary}>
                                    <Portfolio
                                        maxBorrow={maxBorrowLimit}
                                        supplyMarketsData={
                                            supplyMarketsGridData
                                        }
                                        borrowMarketsData={
                                            borrowMarketsGridData
                                        }
                                        showDetailsClickHandler={
                                            showDetailsRedbankClickHandler
                                        }
                                        showDetails={showDetailsRedbank}
                                    />
                                    <div className={styles.tooltip}>
                                        <Tooltip
                                            content={t(
                                                'redbank.redBankTooltip',
                                                {
                                                    collateralLimit:
                                                        formatValue(
                                                            maxLtvPercent,
                                                            2,
                                                            2,
                                                            true,
                                                            false,
                                                            '%'
                                                        ),
                                                    collateralLimitValue:
                                                        formatValue(
                                                            lookup(
                                                                maxBorrowLimit,
                                                                UST_DENOM,
                                                                UST_DECIMALS
                                                            )
                                                        ),
                                                    currentPercentage:
                                                        formatValue(
                                                            ltv,
                                                            2,
                                                            2,
                                                            true,
                                                            false,
                                                            '%'
                                                        ),
                                                }
                                            )}
                                            iconWidth={'18px'}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </>

                    {showDetailsRedbank ? (
                        <div className={styles.grids}>
                            <Card>
                                <Markets
                                    title={t('mystation.myDepositedAssets')}
                                    columns={supplyGridColumns}
                                    data={supplyMarketsGridData}
                                    initialState={supplyGridInitialState}
                                    activeDataFilter={depositsActiveDataFilter}
                                    tooltip={t(
                                        'mystation.marketsDepositedTooltip'
                                    )}
                                />
                            </Card>

                            <Card>
                                <Markets
                                    title={t('mystation.myBorrowedAssets')}
                                    columns={borrowGridColumns}
                                    data={borrowMarketsGridData}
                                    initialState={borrowGridInitialState}
                                    activeDataFilter={borrowedActiveDataFilter}
                                    tooltip={t(
                                        'mystation.marketsBorrowedTooltip'
                                    )}
                                />
                            </Card>
                        </div>
                    ) : null}

                    {FIELDS_FEATURE ? (
                        <>
                            <TitleSeparator title={t('global.fieldsOfMars')} />

                            <div className={styles.fieldOfMarsOverview}>
                                <Card>
                                    <FieldsOfMarsOverview
                                        data={activeStrategiesData}
                                        showDetailsClickHandler={() => {
                                            setShowDetailsFields(
                                                !showDetailsFields
                                            )
                                        }}
                                        showDetails={showDetailsFields}
                                        loaded={loaded}
                                    />
                                </Card>
                            </div>
                        </>
                    ) : null}

                    {showDetailsFields ? (
                        <div className={styles.strategies}>
                            <Strategies
                                active={true}
                                loaded={loaded}
                                title={t('fields.myActiveStrategies')}
                                columns={activeStrategyGridColumns}
                                data={activeStrategiesData}
                                initialState={activeStrategyGridInitialState}
                                ttCopy={
                                    <Trans i18nKey='fields.myActiveStrategiesTooltip' />
                                }
                            />
                        </div>
                    ) : null}

                    {MY_LOCKDROP_FEATURE && !!lockdropPositions?.length && (
                        <>
                            <TitleSeparator title={t('incentives.lockdrop')} />
                            <div className={styles.strategies}>
                                <Card>
                                    <MyLockdrop
                                        loaded={loaded}
                                        title={t('mystation.myLockdrop')}
                                        columns={myLockdropGridColumns}
                                        data={lockdropPositions}
                                        initialState={
                                            myLockdropGridInitialState
                                        }
                                        ttCopy={t(
                                            'mystation.myLockdropTooltip'
                                        )}
                                    />
                                </Card>
                            </div>
                        </>
                    )}
                </Route>
                <Route exact={false} path='/mystation/withdraw/:denom'>
                    <RedbankAction activeView={ViewType.Withdraw} />
                </Route>
                <Route exact={false} path='/mystation/deposit/:denom'>
                    <RedbankAction activeView={ViewType.Deposit} />
                </Route>
                <Route exact={false} path='/mystation/borrow/:denom'>
                    <RedbankAction activeView={ViewType.Borrow} />
                </Route>
                <Route exact={false} path='/mystation/repay/:denom'>
                    <RedbankAction activeView={ViewType.Repay} />
                </Route>
                <Route
                    exact={false}
                    path='/mystation/lockdrop/phase1/:duration'
                >
                    <LockdropAction phase='phase1' />
                </Route>
                <Route exact={false} path='/mystation/lockdrop/phase2'>
                    <LockdropAction phase='phase2' />
                </Route>
            </Switch>
        </div>
    )
}

export default MyStation
