import { Coin } from '@terra-money/terra.js'
import { useEffect, useState } from 'react'
import {
    AUCTION_LP_TOKENS_VESTING_DURATION,
    MARS_DENOM,
    UST_DECIMALS,
    UST_DENOM,
} from '../../constants/appConstants'
import createContext from './../createContext'
import {
    useLockdropLockupPositions,
    useAccountBalance,
    useAuctionUserInfo,
    useMarsLpAssetRate,
    useExchangeRate,
} from '..'
import moment from 'moment'
import ust from '../../images/UST.svg'
import mars from '../../images/MARS-COLORED.svg'

export interface MyLockupGrid {
    lockdropPositions: lockdropPosition[]
}

export const [useMyLockupGrid, MyLockupGridProvider] =
    createContext<MyLockupGrid>('useMyLockupGrid')

export const useMyLockupGridState = (): MyLockupGrid => {
    const { convertMaTokenToUnderlying } = useAccountBalance()
    const { lockupPositions } = useLockdropLockupPositions()
    const { userInfo: auctionUserInfo } = useAuctionUserInfo()
    const { marsLpToAssets } = useMarsLpAssetRate()
    const { exchangeToUusd } = useExchangeRate()

    const [lockdropPositions, setLockdropPositions] = useState<
        lockdropPosition[]
    >([])

    useEffect(() => {
        let positions: lockdropPosition[] = []

        if (lockupPositions?.length) {
            positions.push(
                ...lockupPositions.map((position) => {
                    return {
                        denom: UST_DENOM,
                        decimals: UST_DECIMALS,
                        logos: [ust],
                        position: 'UST',
                        name: 'Terra USD',
                        liquidity: convertMaTokenToUnderlying(
                            UST_DENOM,
                            Number(position?.maust_balance) || 0
                        ),
                        apy: 0,
                        rewards: Number(position?.lockdrop_reward) || 0,
                        unlocked:
                            moment().unix() >= position?.unlock_timestamp
                                ? convertMaTokenToUnderlying(
                                      UST_DENOM,
                                      Number(position?.maust_balance) || 0
                                  )
                                : 0,
                        timestamp: position?.unlock_timestamp || 0,
                        duration: position?.duration,
                    }
                })
            )
        }

        if (
            auctionUserInfo &&
            Number(auctionUserInfo?.total_auction_incentives) > 0
        ) {
            const lockedTokens =
                (Number(auctionUserInfo?.lp_shares) || 0) -
                (Number(auctionUserInfo?.withdrawn_lp_shares) || 0)
            const underlyingTokensLocked = marsLpToAssets(lockedTokens)
            const underlyingTokensUnlocked = marsLpToAssets(
                Number(auctionUserInfo?.withdrawable_lp_shares)
            )
            const uusdValueLocked =
                underlyingTokensLocked.uusd +
                exchangeToUusd(
                    new Coin(MARS_DENOM, underlyingTokensLocked.mars)
                )
            const uusdValueUnlocked =
                underlyingTokensUnlocked.uusd +
                exchangeToUusd(
                    new Coin(MARS_DENOM, underlyingTokensUnlocked.mars)
                )

            const phase2Position: lockdropPosition = {
                denom: UST_DENOM,
                decimals: UST_DECIMALS,
                logos: [mars, ust],
                position: 'MARS-UST',
                name: '',
                liquidity: uusdValueLocked,
                apy: 0,
                rewards: Number(auctionUserInfo.total_auction_incentives),
                unlocked: uusdValueUnlocked,
                timestamp: AUCTION_LP_TOKENS_VESTING_DURATION,
                duration: 0,
            }

            positions.push(phase2Position)
        }

        setLockdropPositions(positions)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lockupPositions, auctionUserInfo])

    return { lockdropPositions }
}
