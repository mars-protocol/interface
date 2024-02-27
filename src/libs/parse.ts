import { BroadcastResult } from '@delphi-labs/shuttle-react'
import BigNumber from 'bignumber.js'
import { DAY_IN_SECONDS, HOUR_IN_SECONDS, MINUTE_IN_SECONDS } from 'constants/timeConstants'
import moment from 'moment'
import numeral from 'numeral'
import { ViewType } from 'types/enums'

import { countDecimals } from './math'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })
type Formatter = (amount: string, symbol: string, decimals: number) => string

const rm = BigNumber.ROUND_HALF_CEIL

export const dp = (decimals: number, symbol?: string): number => decimals

export const lookup = (amount: number, symbol: string, decimals: number): number => {
  const value = new BigNumber(amount)

  return demagnify(value.toNumber(), decimals)
}

export const findAssetByDenom = (denom: string, assets: Asset[] | OtherAsset[]) =>
  assets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())

export const lookupSymbol = (denom: string, assets: Asset[] | OtherAsset[]) =>
  assets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.symbol || ''

export const lookupDecimals = (denom: string, assets: Asset[] | OtherAsset[]) =>
  assets.find((asset) => asset.denom === denom)?.decimals || 6

export const lookupDenomBySymbol = (symbol: string, assets: Asset[] | OtherAsset[]) =>
  assets.find((asset) => asset.symbol.toLowerCase() === symbol.toLowerCase())?.denom || ''

export const format: Formatter = (amount, symbol, decimals): string => {
  const value = new BigNumber(lookup(parseInt(amount || '0'), symbol, decimals))
  const formatted = value.gte(10 ** decimals)
    ? numeral(value.div(1e4).integerValue(rm).times(1e4)).format('0,0.[00]a')
    : numeral(value).format('0,0.[000000]')

  return formatted.toUpperCase()
}

export const formatGasFee = (whitelistedAssets: Asset[], fee = '', denom = '') => {
  if (!whitelistedAssets.length || !fee) return '0'

  return formatValue(format(fee || '0', denom, lookupDecimals(denom, whitelistedAssets)), 2, 2)
}

export const getRoute = (actionType: ViewType) => {
  switch (actionType) {
    case ViewType.Withdraw:
      return 'withdraw'
    case ViewType.Repay:
      return 'repay'
    case ViewType.Deposit:
      return 'deposit'
    case ViewType.Borrow:
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

export const magnify = (value: number, decimals: number) => {
  return value === 0 ? 0 : new BigNumber(value).shiftedBy(decimals).toNumber()
}

export const demagnify = (amount: number, decimals: number) => {
  return amount === 0 ? 0 : new BigNumber(amount).shiftedBy(-1 * decimals).toNumber()
}

const addLeadingZero = (number: number | string): string => {
  return `${number.toString().length === 1 ? '0' : ''}${number.toString()}`
}

export const produceCountdown = (remainingTime: number) => {
  const duration = moment.duration(remainingTime, 'milliseconds')
  const days = formatValue(duration.asDays(), 0, 0, false, false, false, false)

  duration.subtract(days, 'days')
  const hours = formatValue(duration.asHours(), 0, 0, false, false, false, false)

  duration.subtract(hours, 'hours')
  const minutes = formatValue(duration.asMinutes(), 0, 0, false, false, false, true)

  return `${addLeadingZero(days)}D : ${addLeadingZero(hours)}H : ${addLeadingZero(minutes)}M`
}

export const formatDate = (timestamp: number) => {
  const date = moment(timestamp)
  return date.format('L')
}

export const formatUnlockDate = (timestamp: number, unlockTimeInSeconds?: number) => {
  const date = moment(timestamp)

  if (unlockTimeInSeconds) {
    date.add(unlockTimeInSeconds, 'seconds')
  }
  return date.format('MMM D, HH:mm')
}

export const formatValue = (
  amount: number | string,
  minDecimals = 2,
  maxDecimals = 2,
  thousandSeparator = true,
  prefix: boolean | string = false,
  suffix: boolean | string = false,
  rounded = false,
  abbreviated = true,
): string => {
  let numberOfZeroDecimals: number | null = null
  if (typeof amount === 'string') {
    const decimals = amount.split('.')[1] ?? null
    if (decimals && Number(decimals) === 0) {
      numberOfZeroDecimals = decimals.length
    }
  }
  let convertedAmount: number | string = +amount || 0

  const amountSuffix = abbreviated
    ? convertedAmount >= 1_000_000_000
      ? 'B'
      : convertedAmount >= 1_000_000
      ? 'M'
      : convertedAmount >= 1_000
      ? 'K'
      : false
    : ''

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
          convertedAmount = `${amountFractions[0]}.${amountFractions[1].substr(0, maxDecimals)}`
        }
        if (amountFractions[1].length < minDecimals) {
          convertedAmount = `${amountFractions[0]}.${amountFractions[1].padEnd(minDecimals, '0')}`
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

  if (suffix) {
    returnValue += suffix
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

export const getTimeAndUnit = (seconds: number): { time: string; unit: string } => {
  const formatted = formatCooldown(seconds)
  const time = formatted.split(' ')[0]
  const unit = formatted.split(' ')[1]
  return { time, unit }
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
export const convertAprToApy = (apr: number, numberOfCompoundingPeriods: number): number => {
  return ((1 + apr / 100 / numberOfCompoundingPeriods) ** numberOfCompoundingPeriods - 1) * 100
}

export const convertApyToDailyApy = (apy: number): number => {
  return Math.round((Math.pow(1 + apy / 100, 1 / 365) - 1) * 10000) / 100
}

export const roundToDecimals = (value: number, decimals: number) =>
  Math.round(value * Number(`1e${decimals}`)) / Number(`1e${decimals}`)

export const extractCoinFromLog = (text: string) => {
  const [, ...arr] = text.match(/(\d*)([\s\S]*)/) || []
  return { amount: arr[0], denom: arr[1] }
}

export const parseActionMessages = (data: BroadcastResult) => {
  const wasmEvents: [] = data.response.events
    .filter((object: Record<string, string>) => object.type === 'wasm')
    .map((event: Record<string, string>) => event?.attributes)
    .flat()

  if (wasmEvents.length) {
    return wasmEvents.reduce((prev: {}[], curr: any) => {
      if (curr.key === 'action') {
        prev.push({ [curr.key]: curr.value })
        return prev
      } else {
        if (prev.length) {
          Object.assign(prev[prev.length - 1], { [curr.key]: curr.value })
        }
        return prev
      }
    }, [])
  }
}

export const toBase64 = (obj: object) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}

export const ltvToLeverage = (ltv: number) => {
  const leverage = 1 / (1 - ltv)
  return new BigNumber(leverage).decimalPlaces(2).toNumber()
}

export const leverageToLtv = (leverage: number) =>
  new BigNumber(1).div(leverage).minus(1).times(-1).toNumber()

export const serializeUrl = (url?: string) =>
  url ? (url.slice(-1) === '/' ? url : `${url}/`) : '/'
