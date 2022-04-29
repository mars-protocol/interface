import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import {
    AccountBalanceProvider,
    useAccountBalanceState,
} from '../hooks/useAccountBalance'
import { RedBankProvider, useRedBankState } from '../hooks/useRedBank'
import { useMarsOracleState } from '../hooks/useMarsOracle'
import { useAstroportSpotOracleState } from '../hooks/useAstroportSpotOracle'
import {
    ExchangeRateProvider,
    useExchangeRateState,
} from '../hooks/useExchangeRate'
import { useInterval } from '../hooks'
import routes from '../routes'
import Header from './Header'
import NotConnected from './NotConnected'
import './App.scss'
import { CW20Provider, useCW20State } from '../hooks/useCW20'
import {
    MarsBalanceProvider,
    useMarsBalanceState,
} from '../hooks/useMarsBalance'
import { BasecampProvider, useBasecampState } from '../hooks/useBasecamp'
import { StakingProvider, useStakingState } from '../hooks/useStaking'
import {
    AddressProviderProvider,
    useAddressProviderState,
} from '../hooks/useAddressProvider'
import { AssetGridProvider, useAssetGridState } from '../hooks/useAssetGrid'
import { IncentivesProvider, useIncentivesState } from '../hooks/useIncentives'
import { AirdropProvider, useAirdropState } from '../hooks/lockdrop/useAirdrop'
import {
    LockdropUserInfoProvider,
    useLockdropUserInfoState,
} from '../hooks/lockdrop/useLockdropUserInfo'
import {
    LockdropLockupPositionsProvider,
    useLockdropLockupPositionsState,
} from '../hooks/lockdrop/useLockdropLockupPositions'
import {
    AuctionUserInfoProvider,
    useAuctionUserInfoState,
} from '../hooks/lockdrop/useAuctionUserInfo'
import {
    MarsLpAssetRateProvider,
    useMarsLpAssetRateState,
} from '../hooks/lockdrop/useMarsLpAssetRate'
import { VestingProvider, useVestingState } from '../hooks/useVesting'
import NetworkNotSupported from './NetworkNotSupported'
import { State } from '../types/enums'
import { useEffect } from 'react'
import useStore from '../store'

const App = () => {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') {
            Sentry.init({
                dsn: process.env.REACT_APP_SENTRY_DSN,
                integrations: [
                    new Integrations.BrowserTracing(),
                    new Sentry.Integrations.Breadcrumbs({
                        console: false,
                    }),
                ],
                tracesSampleRate: 1,
                environment: process.env.REACT_APP_STAGE,
            })
        }
    }, [])

    const userWalletAddress = useStore((s) => s.userWalletAddress)
    const latestBlockHeight = useStore((s) => s.latestBlockHeight)
    const cw20State = useCW20State()

    const basecamp = useBasecampState()
    const addressProvider = useAddressProviderState(basecamp.config)
    const vesting = useVestingState(
        userWalletAddress,
        addressProvider.config?.vesting_address,
        latestBlockHeight
    )
    const redBank = useRedBankState(
        addressProvider.config?.red_bank_address,
        addressProvider.config?.incentives_address,
        userWalletAddress
    )
    const marsBalance = useMarsBalanceState(
        addressProvider.config?.mars_token_address,
        addressProvider.config?.xmars_token_address,
        userWalletAddress
    )

    const stakingState = useStakingState(
        addressProvider.config?.staking_address,
        marsBalance,
        addressProvider.config?.mars_token_address,
        addressProvider.config?.xmars_token_address
    )

    const incentivesState = useIncentivesState(
        addressProvider.config?.incentives_address
    )

    const accountBalance = useAccountBalanceState(
        userWalletAddress,
        redBank.findMarketInfo
    )

    const marsOracle = useMarsOracleState(
        addressProvider.config?.oracle_address
    )
    const astroportSpotOracle = useAstroportSpotOracleState()
    const exchangeRate = useExchangeRateState(marsOracle, astroportSpotOracle)

    const assetGridState = useAssetGridState(
        accountBalance,
        redBank,
        exchangeRate
    )
    const airdrop = useAirdropState(userWalletAddress)
    const lockdropUserInfo = useLockdropUserInfoState(userWalletAddress)
    const lockdropLockupPositions = useLockdropLockupPositionsState(
        userWalletAddress,
        lockdropUserInfo?.userInfo?.lockup_position_ids
    )
    const MarsLpAssetRate = useMarsLpAssetRateState()

    const auctionUserInfo = useAuctionUserInfoState(userWalletAddress)
    // const { errors } = useErrors()

    const states = [redBank.state, accountBalance.state, exchangeRate.state]

    const appState = states.every((state) => state === State.READY)
        ? State.READY
        : states.some((state) => state === State.INITIALISING)
        ? State.INITIALISING
        : State.ERROR

    useInterval(
        incentivesState.refetch,
        appState === State.READY ? 30000 : null
    )
    useInterval(exchangeRate.refetch, appState === State.READY ? 30000 : null)

    const getBody = () => {
        switch (appState) {
            case State.READY:
                return <div className={'body'}>{routes()}</div>
            case State.INITIALISING:
                if (userWalletAddress) {
                    return <NetworkNotSupported />
                } else {
                    return <></>
                }
            case State.ERROR:
                // if (errors.network) {
                //     return <div className={'body'}>{routes()}</div>
                // } else
                if (userWalletAddress) {
                    return <NetworkNotSupported />
                } else {
                    return <NotConnected />
                }
        }
    }

    return (
        <AccountBalanceProvider value={accountBalance}>
            <RedBankProvider value={redBank}>
                <BasecampProvider value={basecamp}>
                    <AddressProviderProvider value={addressProvider}>
                        <VestingProvider value={vesting}>
                            <MarsBalanceProvider value={marsBalance}>
                                <CW20Provider value={cw20State}>
                                    <StakingProvider value={stakingState}>
                                        <IncentivesProvider
                                            value={incentivesState}
                                        >
                                            <ExchangeRateProvider
                                                value={exchangeRate}
                                            >
                                                <AssetGridProvider
                                                    value={assetGridState}
                                                >
                                                    {/* Mars launch related hooks */}
                                                    <AirdropProvider
                                                        value={airdrop}
                                                    >
                                                        <LockdropUserInfoProvider
                                                            value={
                                                                lockdropUserInfo
                                                            }
                                                        >
                                                            <LockdropLockupPositionsProvider
                                                                value={
                                                                    lockdropLockupPositions
                                                                }
                                                            >
                                                                <AuctionUserInfoProvider
                                                                    value={
                                                                        auctionUserInfo
                                                                    }
                                                                >
                                                                    <MarsLpAssetRateProvider
                                                                        value={
                                                                            MarsLpAssetRate
                                                                        }
                                                                    >
                                                                        {/* Mars launch related hooks */}
                                                                        <div className='app'>
                                                                            <div
                                                                                className={
                                                                                    appState ===
                                                                                    State.READY
                                                                                        ? 'background'
                                                                                        : 'background night'
                                                                                }
                                                                                id='bg'
                                                                            />
                                                                            <Header />
                                                                            <div className='appContainer'>
                                                                                <div className='widthBox'>
                                                                                    {getBody()}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {/* Mars launch related hooks */}
                                                                    </MarsLpAssetRateProvider>
                                                                </AuctionUserInfoProvider>
                                                            </LockdropLockupPositionsProvider>
                                                        </LockdropUserInfoProvider>
                                                    </AirdropProvider>
                                                    {/* Mars launch related hooks */}
                                                </AssetGridProvider>
                                            </ExchangeRateProvider>
                                        </IncentivesProvider>
                                    </StakingProvider>
                                </CW20Provider>
                            </MarsBalanceProvider>
                        </VestingProvider>
                    </AddressProviderProvider>
                </BasecampProvider>
            </RedBankProvider>
        </AccountBalanceProvider>
    )
}

export default App
