import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { LcdClient } from '@cosmjs/launchpad'
import { Coin } from '@cosmjs/stargate'
import { WalletChainInfo, WalletSigningCosmWasmClient } from '@marsprotocol/wallet-connector'
import BigNumber from 'bignumber.js'
import { BlockHeightData } from 'hooks/queries/useBlockHeight'
import { MarketDepositsData } from 'hooks/queries/useMarketDeposits'
import { SafetyFundBalanceData } from 'hooks/queries/useSafetyFundBalance'
import { UserBalanceData } from 'hooks/queries/useUserBalance'
import isEqual from 'lodash.isequal'
import { CommonSlice } from 'store/interfaces/common.interface'
import { OraclesSlice } from 'store/interfaces/oracles.interface'
import { Network } from 'types/enums/network'
import { GetState } from 'zustand'
import { NamedSet } from 'zustand/middleware'

const commonSlice = (
  set: NamedSet<CommonSlice & OraclesSlice>,
  get: GetState<CommonSlice & OraclesSlice>,
): CommonSlice => ({
  // ------------------
  // VARIABLES
  // ------------------
  baseCurrency: {
    denom: 'uosmo',
    symbol: 'OSMO',
    decimals: 6,
  },
  displayCurrency: {
    // The denom of DAI, not USDC
    denom: 'ibc/88D70440A05BFB25C7FF0BA62DA357EAA993CB1B036077CF1DAAEFB28721D935',
    prefix: '$',
    suffix: '',
    decimals: 2,
  },
  currentNetwork: Network.TESTNET,
  errors: {
    network: false,
    query: false,
    server: false,
  },
  isNetworkLoaded: false,
  latestBlockHeight: 0,
  marketDeposits: [],
  otherAssets: [],
  queryErrors: [],
  slippage: 0.02,
  tutorialSteps: { redbank: 1, fields: 1 },
  userWalletName: '',
  userBalances: [],
  userMarsTokenBalances: [],
  userUnclaimedRewards: '0',
  userWalletAddress: '',
  vaultConfigs: [],
  whitelistedAssets: [],
  // ------------------
  // GENERAL FUNCTIONS
  // ------------------
  convertToBaseCurrency: (coin: Coin) => {
    const exchangeRates = get().exchangeRates

    if (!exchangeRates || !coin) return 0

    const exchangeRate = exchangeRates?.find(
      (exchangeRate) => exchangeRate.denom === coin.denom,
    )?.amount
    if (!exchangeRate) return 0

    return new BigNumber(coin.amount).times(exchangeRate).toNumber()
  },
  convertValueToAmount: (coin: Coin) => {
    const exchangeRates = get().exchangeRates

    if (!exchangeRates || !coin) return 0

    const exchangeRate = exchangeRates?.find(
      (exchangeRate) => exchangeRate.denom === coin.denom,
    )?.amount
    if (!exchangeRate) return 0

    return new BigNumber(coin.amount).div(exchangeRate).toNumber()
  },
  executeMsg: async (options: StrategyExecuteMsgOptions): Promise<ExecuteResult | undefined> => {
    const client = get().client!

    if (!options.sender) options.sender = get().userWalletAddress

    try {
      return client.execute(
        options.sender,
        options.contract,
        options.msg as Record<string, unknown>,
        options.fee,
        undefined,
        options.funds,
      )
    } catch (e) {}
  },
  loadNetworkConfig: async () => {
    try {
      const config = await import(`../../configs/${get().currentNetwork}.ts`)
      set({
        otherAssets: config.NETWORK_CONFIG.assets.other,
        whitelistedAssets: config.NETWORK_CONFIG.assets.whitelist,
        networkConfig: config.NETWORK_CONFIG,
        isNetworkLoaded: true,
        baseAsset: config.NETWORK_CONFIG.assets.base,
        vaultConfigs: config.VAULT_CONFIGS,
      })
    } catch (e) {
      set({ isNetworkLoaded: false })
    }
  },
  queryContract: async <T>(contractAddress: string, queryMsg: object, retries = 3) => {
    let attempts = 0
    while (attempts < retries) {
      const lcdClient = get().lcdClient
      if (!lcdClient) return
      try {
        const res = await lcdClient.get(contractAddress, queryMsg)
        return res
      } catch (exception: any) {
      } finally {
        attempts += 1
      }
    }
  },
  // ------------------
  // SETTERS
  // ------------------
  setLcdClient: (rpc: string) => {
    set({
      lcdClient: new LcdClient(rpc),
    })
  },
  setChainInfo: (chainInfo: WalletChainInfo) => set({ chainInfo }),
  setCurrentNetwork: (network: Network) => set({ currentNetwork: network }),
  setNetworkError: (isError: boolean) => {
    const errors = get().errors
    if (isError !== errors.network) {
      errors.network = isError
      set({ errors })
    }
  },
  setClient: (client: WalletSigningCosmWasmClient) => set({ client }),
  setQueryError: (name: string, isError: boolean) => {
    const errors = get().errors
    const queryErrors = get().queryErrors

    if (isError && !queryErrors.includes(name)) {
      queryErrors.push(name)
      errors.query = true
    } else if (!isError && queryErrors.includes(name)) {
      const idx = queryErrors.indexOf(name)
      queryErrors.splice(idx, 1)
      errors.query = !!queryErrors.length
    }

    set({ errors, queryErrors })
  },
  setServerError: (isError: boolean) => {
    const errors = get().errors
    if (isError !== errors.server) {
      errors.server = isError
      set({ errors })
    }
  },
  setTutorialStep: (type: 'fields' | 'redbank', step?: number) => {
    const tutorialSteps = get().tutorialSteps
    tutorialSteps[type] = step ? step : tutorialSteps[type] + 1
    set({ tutorialSteps })
  },
  setUserWalletAddress: (address: string) => set({ userWalletAddress: address }),
  setUserWalletName: (name: string) => set({ userWalletName: name }),
  // -------------------
  // QUERY RELATED
  // -------------------
  processBlockHeightQuery: (data: BlockHeightData) => {
    if (isEqual(data, get().previousBlockHeightQueryData)) return

    const blockFetched = Number(data.tendermint.blockInfo.block.header.height) || -1

    if (blockFetched !== -1) set({ latestBlockHeight: blockFetched })
    set({ previousBlockHeightQueryData: data })
  },
  processMarketDepositsQuery: (data: MarketDepositsData) => {
    const whitelistedAssets = get().whitelistedAssets
    if (!whitelistedAssets.length) return

    const coins: Coin[] = whitelistedAssets.map((asset) => ({
      amount: data.mdwasmkey[`${asset.symbol}Deposits`],
      denom: asset.denom,
    }))

    set({ marketDeposits: coins })
  },
  processSafetyFundQuery: (data: SafetyFundBalanceData) => {
    if (isEqual(data, get().previousSafetyFundBalanceQueryData)) return

    set({
      previousSafetyFundBalanceQueryData: data,
      safetyFundBalance: data.balance.balance[0],
    })
  },
  processUserBalanceQuery: (data: UserBalanceData) => {
    if (isEqual(data, get().previousUserBalanceQueryData)) return

    set({
      previousUserBalanceQueryData: data,
      userBalances: data.balance.balance,
    })
  },
})

export default commonSlice
