import BigNumber from 'bignumber.js'
import moment from 'moment'
import numeral from 'numeral'
import { GridActionType } from '../components/grid/GridActions'
import {
    DAY_IN_SECONDS,
    HOUR_IN_SECONDS,
    MINUTE_IN_SECONDS,
} from '../constants/timeConstants'
import { countDecimals } from './math'

BigNumber.config({ EXPONENTIAL_AT: [-18, 20] })

type Formatter = (amount: string, symbol: string, decimals: number) => string

const rm = BigNumber.ROUND_HALF_CEIL

export const dp = (decimals: number, symbol?: string): number =>
    !symbol || symbol === 'uusd' ? 2 : decimals

export const lookup = (
    amount: number,
    symbol: string,
    decimals: number
): number => {
    const value = symbol
        ? new BigNumber(amount).div(10 ** decimals)
        : new BigNumber(amount)

    return value.dp(dp(decimals, symbol), rm).toNumber()
}

export const lookupSymbol = (
    denom: string,
    whitelistedAssets: WhitelistAsset[]
) =>
    whitelistedAssets.find(
        (asset) => asset.denom.toLowerCase() === denom.toLowerCase()
    )?.symbol || ''

export const lookupCw20Contract = (
    denom: string,
    whitelistedAssets: WhitelistAsset[]
) =>
    whitelistedAssets.find((asset) => asset.denom === denom)?.contract_addr ||
    ''

export const lookupDecimals = (
    denom: string,
    whitelistedAssets: WhitelistAsset[]
) => whitelistedAssets.find((asset) => asset.denom === denom)?.decimals || 6

export const format: Formatter = (amount, symbol, decimals): string => {
    const value = new BigNumber(
        lookup(parseInt(amount || '0'), symbol, decimals)
    )
    const formatted = value.gte(10 ** decimals)
        ? numeral(value.div(1e4).integerValue(rm).times(1e4)).format(
              '0,0.[00]a'
          )
        : numeral(value).format('0,0.[000000]')

    return formatted.toUpperCase()
}

export const formatGasFee = (
    whitelistedAssets?: WhitelistAsset[],
    fee?: string
) => {
    if (!whitelistedAssets) return '0'

    const gasFeeDenom = 'uusd'

    return formatValue(
        format(
            fee || '0',
            gasFeeDenom,
            lookupDecimals(gasFeeDenom, whitelistedAssets)
        ),
        2,
        2
    )
}

export const formatTax = (
    whitelistedAssets?: WhitelistAsset[],
    tax?: string,
    denom?: string
) => {
    if (!whitelistedAssets) return '0'

    const defaultTaxDenom = 'uusd'

    return format(
        tax || '0',
        denom || defaultTaxDenom,
        lookupDecimals(denom || defaultTaxDenom, whitelistedAssets)
    )
}

export const getRoute = (actionType: GridActionType) => {
    switch (actionType) {
        case GridActionType.WithdrawAction:
            return 'withdraw'
        case GridActionType.RepayAction:
            return 'repay'
        case GridActionType.DepositAction:
            return 'deposit'
        case GridActionType.BorrowAction:
            return 'borrow'
        default:
            return 'unsupported'
    }
}

export const toAmount = (value: string, decimals: number): string =>
    value
        ? new BigNumber(value)
              .times(10 ** decimals)
              .integerValue()
              .toString()
        : '0'

export const magnify = (value: number, decimals: number): BigNumber | number =>
    value ? new BigNumber(value).times(10 ** decimals).integerValue() : 0

const addLeadingZero = (number: number | string): string => {
    return `${number.toString().length === 1 ? '0' : ''}${number.toString()}`
}

export const produceCountdown = (remainingTime: number) => {
    let duration = moment.duration(remainingTime, 'milliseconds')
    const days = formatValue(
        duration.asDays(),
        0,
        0,
        false,
        false,
        false,
        false
    )

    duration.subtract(days, 'days')
    const hours = formatValue(
        duration.asHours(),
        0,
        0,
        false,
        false,
        false,
        false
    )

    duration.subtract(hours, 'hours')
    const minutes = formatValue(
        duration.asMinutes(),
        0,
        0,
        false,
        false,
        false,
        true
    )

    return `${addLeadingZero(days)}:${addLeadingZero(hours)}:${addLeadingZero(
        minutes
    )}`
}

export const formatValue = (
    amount: number | string,
    minDecimals: number = 2,
    maxDecimals: number = 2,
    thousandSeparator: boolean = true,
    prefix: boolean | string = false,
    suffix: boolean | string = true,
    rounded: boolean = false
): string => {
    let numberOfZeroDecimals: number | null = null
    if (typeof amount === 'string') {
        const decimals = amount.split('.')[1] ?? null
        if (decimals && Number(decimals) === 0) {
            numberOfZeroDecimals = decimals.length
        }
    }
    let convertedAmount: number | string = +amount || 0

    const amountSuffix =
        suffix !== true
            ? suffix
            : convertedAmount >= 1_000_000_000
            ? 'B'
            : convertedAmount >= 1_000_000
            ? 'M'
            : convertedAmount >= 1_000
            ? 'K'
            : false
    const amountPrefix = prefix

    if (amountSuffix === 'B') {
        convertedAmount = Number(amount) / 1_000_000_000
    }
    if (amountSuffix === 'M') {
        convertedAmount = Number(amount) / 1_000_000
    }
    if (amountSuffix === 'K') {
        convertedAmount = Number(amount) / 1_000
    }

    if (rounded) {
        convertedAmount = convertedAmount.toFixed(maxDecimals)
    } else {
        const amountFractions = String(convertedAmount).split('.')
        if (maxDecimals > 0) {
            if (typeof amountFractions[1] !== 'undefined') {
                if (amountFractions[1].length >= maxDecimals) {
                    convertedAmount = `${
                        amountFractions[0]
                    }.${amountFractions[1].substr(0, maxDecimals)}`
                }
                if (amountFractions[1].length < minDecimals) {
                    convertedAmount = `${
                        amountFractions[0]
                    }.${amountFractions[1].padEnd(minDecimals, '0')}`
                }
            }
        } else {
            convertedAmount = amountFractions[0]
        }
    }

    if (thousandSeparator) {
        convertedAmount = Number(convertedAmount).toLocaleString('en', {
            useGrouping: true,
            minimumFractionDigits: minDecimals,
            maximumFractionDigits: maxDecimals,
        })
    }

    let returnValue = ''
    if (amountPrefix) {
        returnValue += amountPrefix
    }
    returnValue += convertedAmount

    // Used to allow for numbers like 1.0 or 3.00 (otherwise impossible with string to number conversion)
    if (numberOfZeroDecimals) {
        if (numberOfZeroDecimals < maxDecimals) {
            returnValue = Number(returnValue).toFixed(numberOfZeroDecimals)
        } else {
            returnValue = Number(returnValue).toFixed(maxDecimals)
        }
    }

    if (amountSuffix) {
        returnValue += amountSuffix
    }

    return returnValue
}

export const parseNumberInput = (input?: string): number => {
    if (!input) return 0
    const convertedInput = input.replace(/[`~!@#$%^&*()e_|+\-=?;:'"<>]/gi, '')

    return Number(convertedInput) || 0
}

export const handleNumberKeyDown = (e: any, decimals: number) => {
    if (e.key === ' ') {
        e.preventDefault()
    }
    if (e.key === 'e') {
        e.preventDefault()
    }
    if (e.key === '+') {
        e.preventDefault()
    }
    if (e.key === '-') {
        e.preventDefault()
    }

    const fractions = e.target.value.split('.')
    if (typeof fractions[1] !== 'undefined') {
        if (fractions[1].length >= decimals) {
            if (e.key === '0') {
                e.preventDefault()
            }
        }
    }
}

export const formatCooldown = (seconds: number): string => {
    const getString = (value: number, unit: string) => {
        const decimals = countDecimals(value)
        if (decimals > 2) {
            return `~${value.toFixed(2)} ${unit}`
        }
        return `${value} ${unit}`
    }

    if (seconds / DAY_IN_SECONDS > 1) {
        return getString(seconds / DAY_IN_SECONDS, 'days')
    } else if (seconds / HOUR_IN_SECONDS > 1) {
        return getString(seconds / HOUR_IN_SECONDS, 'hours')
    } else if (seconds / MINUTE_IN_SECONDS > 1) {
        return getString(seconds / MINUTE_IN_SECONDS, 'minutes')
    } else {
        return `${seconds} seconds`
    }
}

/**
 * Converts apr to apy
 * formula: APY = ((1 + apr / 100 / numberOfCompoundingPeriods) ** numberOfCompoundingPeriods - 1) * 100
 * source: https://en.wikipedia.org/wiki/Annual_percentage_yield
 *
 * @param {number} apr as a percentage, note we need to turn this into a decimal during calculation and then return percentage again
 * @param {number} numberOfCompoundingPeriods number of times a year the position will be compounded
 * @return {number} apy - anual percentage yield
 */
export const convertAprToApy = (
    apr: number,
    numberOfCompoundingPeriods: number
): number => {
    return (
        ((1 + apr / 100 / numberOfCompoundingPeriods) **
            numberOfCompoundingPeriods -
            1) *
        100
    )
}
