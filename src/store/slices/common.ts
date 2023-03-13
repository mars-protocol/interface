import { LcdClient } from '@cosmjs/launchpad'
import { Coin } from '@cosmjs/stargate'
import {
  MsgExecuteContract,
  SimplifiedChainInfo,
  TxBroadcastResult,
  WalletClient,
} from '@marsprotocol/wallet-connector'
import BigNumber from 'bignumber.js'
import { BlockHeightData } from 'hooks/queries/useBlockHeight'
import { DepositAndDebtData } from 'hooks/queries/useDepositAndDebt'
import { UserBalanceData } from 'hooks/queries/useUserBalance'
import { serializeUrl } from 'libs/parse'
import isEqual from 'lodash.isequal'
import { isMobile } from 'react-device-detect'
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
  currentNetwork: Network.TESTNET,
  errors: {
    network: false,
    query: false,
    server: false,
  },
  isNetworkLoaded: false,
  latestBlockHeight: 0,
  marketDeposits: [],
  marketDebts: [],
  otherAssets: [],
  queryErrors: [],
  slippage: 0.02,
  tutorialSteps: { redbank: 1, fields: 1 },
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
  executeMsg: async (
    options: StrategyExecuteMsgOptions,
  ): Promise<TxBroadcastResult | undefined> => {
    const client = get().client!

    if (!options.sender) options.sender = get().userWalletAddress

    const broadcastOptions = {
      messages: [
        new MsgExecuteContract({
          sender: options.sender,
          contract: options.contract,
          msg: options.msg,
          funds: options.funds,
        }),
      ],
      feeAmount: options.fee.amount[0].amount,
      gasLimit: options.fee.gas,
      memo: undefined,
      wallet: client.recentWallet,
      mobile: isMobile,
    }

    try {
      return client.broadcast(broadcastOptions)
    } catch (e) {
      console.error('transaction', e)
    }
  },
  loadNetworkConfig: async () => {
    try {
      const config = await import(`../../configs/${get().currentNetwork}.ts`)

      config.NETWORK_CONFIG.hiveUrl = serializeUrl(config.NETWORK_CONFIG.hiveUrl)
      config.NETWORK_CONFIG.rpcUrl = serializeUrl(config.NETWORK_CONFIG.rpcUrl)
      config.NETWORK_CONFIG.restUrl = serializeUrl(config.NETWORK_CONFIG.restUrl)

      const storageDisplayCurrency = localStorage.getItem('displayCurrency')
      if (storageDisplayCurrency) {
        config.NETWORK_CONFIG.displayCurrency = JSON.parse(storageDisplayCurrency)
      }

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
  setChainInfo: (chainInfo: SimplifiedChainInfo) => {
    if (chainInfo?.rpc) chainInfo.rpc = serializeUrl(chainInfo.rpc)
    if (chainInfo?.rest) chainInfo.rest = serializeUrl(chainInfo.rest)
    set({ chainInfo })
  },
  setCurrentNetwork: (network: Network) => set({ currentNetwork: network }),
  setNetworkError: (isError: boolean) => {
    const errors = get().errors
    if (isError !== errors.network) {
      errors.network = isError
      set({ errors })
    }
  },
  setClient: (client: WalletClient) => set({ client }),
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
  setUserIcns: (icns: string) => set({ userIcns: icns }),
  // -------------------
  // QUERY RELATED
  // -------------------
  processBlockHeightQuery: (data: BlockHeightData) => {
    if (isEqual(data, get().previousBlockHeightQueryData)) return

    const blockFetched = Number(data.tendermint.blockInfo.block.header.height) || -1

    if (blockFetched !== -1) set({ latestBlockHeight: blockFetched })
    set({ previousBlockHeightQueryData: data })
  },
  processDepositAndDebtQuery: (data: DepositAndDebtData) => {
    const whitelistedAssets = get().whitelistedAssets
    if (!whitelistedAssets.length) return

    const depositCoins: Coin[] = whitelistedAssets.map((asset) => ({
      amount: data.mdwasmkey[`${asset.symbol}Deposits`],
      denom: asset.denom,
    }))

    const debtCoins: Coin[] = whitelistedAssets.map((asset) => ({
      amount: data.mdwasmkey[`${asset.symbol}Debt`],
      denom: asset.denom,
    }))

    set({ marketDeposits: depositCoins, marketDebts: debtCoins })
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
