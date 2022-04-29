import { Coin } from '@terra-money/terra.js'

import createContext from './createContext'
import { MarsOracle } from '../hooks/useMarsOracle'
import { AstroportSpotOracle } from '../hooks/useAstroportSpotOracle'
import { lookupDecimals } from '../libs/parse'
import { UST_DECIMALS } from '../constants/appConstants'
import { State } from '../types/enums'
import { useEffect, useState } from 'react'
import useStore from '../store'

export interface ExchangeRates {
    state: State
    uusdExchangeRates: Coin[] | undefined
    exchangeToUusd: (coin: Coin | undefined) => number
    refetch: () => void
}

export const [useExchangeRate, ExchangeRateProvider] =
    createContext<ExchangeRates>('useExchangeRate')

export const useExchangeRateState = (
    marsOracle: MarsOracle,
    astroSpotOracle: AstroportSpotOracle
): ExchangeRates => {
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const otherAssets = useStore((s) => s.otherAssets)
    const [uusdExchangeRates, setUusdExchangeRates] = useState<Coin[]>([])
    const [state, setState] = useState<State>(State.INITIALISING)

    const refetch = () => {
        marsOracle.refetch()
        astroSpotOracle.refetch()
    }

    useEffect(() => {
        setUusdExchangeRates([
            // Spread the marsOracle Coins first. find() is used on the array, which matches the first element,
            // so marsOracle takes preference over astrSpotOracle
            ...(marsOracle?.uusdExchangeRates || []),
            ...(astroSpotOracle?.uusdExchangeRates || []),
        ])
    }, [marsOracle.uusdExchangeRates, astroSpotOracle.uusdExchangeRates])

    useEffect(() => {
        setState(
            marsOracle.state === State.READY &&
                astroSpotOracle.state === State.READY
                ? State.READY
                : marsOracle.state === State.ERROR ||
                  astroSpotOracle.state === State.ERROR
                ? State.ERROR
                : State.INITIALISING
        )
    }, [marsOracle.state, astroSpotOracle.state])

    const exchangeToUusd = (coin: Coin | undefined): number => {
        if (!coin || !uusdExchangeRates || !whitelistedAssets || !otherAssets)
            return 0

        const exchangeRate: Coin | undefined = uusdExchangeRates.find(
            (exchangeRate) => exchangeRate.denom === coin.denom
        )

        const allAssets = [...whitelistedAssets, ...otherAssets]
        let uusdAmount = coin.amount.toNumber()
        if (exchangeRate) {
            // First we need to convert the coin from it's minor to it's major representation to take into account dp discrepancies
            const coinMajorAmount =
                coin.amount.toNumber() /
                10 ** lookupDecimals(coin.denom, allAssets)
            // Then we convert major to UST value
            const ustAmount = coinMajorAmount * exchangeRate.amount.toNumber()
            // Once converted to UST we convert back to uusd
            uusdAmount = ustAmount * 10 ** UST_DECIMALS

            return uusdAmount > 0.009 ? uusdAmount : 0
        }

        return uusdAmount
    }

    return {
        state,
        uusdExchangeRates,
        exchangeToUusd,
        refetch,
    }
}
