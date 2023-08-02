import { Coin } from '@cosmjs/stargate'
import { State } from 'types/enums'

export interface OraclesSlice {
  // ------------------
  // VARIABLES
  // ------------------
  exchangeRates?: Coin[]
  exchangeRatesState: State
  assetPricesUSD?: Coin[]
  assetPricesUSDState: State
  marsPriceState: State
  basePriceState: State
  migrationInProgress: boolean
  pythVaa: VaaInformation
  // ------------------
  // GENERAL FUNCTIONS
  // ------------------
  handleMigration: () => void
  convertToDisplayCurrency: (coin: Coin) => number
  getExchangeRate: (denom1: string, denom2?: string) => number
  calculateExchangeRates: () => void
  // ------------------
  // SETTERS
  // ------------------
  setExchangeRatesState: (state: State) => void
  setPythVaa: (sources: PriceSource[]) => void
  // ------------------
  // QUERY RELATED
  // ------------------
  previousMarsOracleQueryData?: OracleData
  processMarsOracleQuery: (data: OracleData) => void
}
