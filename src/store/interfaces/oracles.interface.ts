import { Coin } from '@cosmjs/stargate'
import { MarsOracleData } from 'hooks/queries/useMarsOracle'
import { State } from 'types/enums'

export interface OraclesSlice {
  // ------------------
  // VARIABLES
  // ------------------
  exchangeRates?: Coin[]
  exchangeRatesState: State
  // ------------------
  // GENERAL FUNCTIONS
  // ------------------
  convertToDisplayCurrency: (coin: Coin) => number
  getExchangeRate: (denom1: string, denom2?: string) => number
  // ------------------
  // SETTERS
  // ------------------
  setExchangeRatesState: (state: State) => void
  // ------------------
  // QUERY RELATED
  // ------------------
  previousMarsOracleQueryData?: MarsOracleData
  processMarsOracleQuery: (data: MarsOracleData) => void
}
