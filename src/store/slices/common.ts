import { LcdClient } from '@cosmjs/launchpad'
import { Coin } from '@cosmjs/stargate'
import {
  ChainInfoID,
  MsgExecuteContract,
  SimplifiedChainInfo,
  TxBroadcastResult,
} from '@marsprotocol/wallet-connector'
import BigNumber from 'bignumber.js'
import { DISPLAY_CURRENCY_KEY, SUPPORTED_CHAINS } from 'constants/appConstants'
import { BlockHeightData } from 'hooks/queries/useBlockHeight'
import { DepositAndDebtData } from 'hooks/queries/useDepositAndDebt'
import { UserBalanceData } from 'hooks/queries/useUserBalance'
import { getNetworkConfig, getNetworkVaultConfig } from 'libs/networkConfig'
import { demagnify, magnify, serializeUrl } from 'libs/parse'
import { getPythVaaMessage } from 'libs/pyth'
import isEqual from 'lodash.isequal'
import { isMobile } from 'react-device-detect'
import { CommonSlice } from 'store/interfaces/common.interface'
import { OraclesSlice } from 'store/interfaces/oracles.interface'
import { GetState } from 'zustand'
import { NamedSet } from 'zustand/middleware'

const commonSlice = (
  set: NamedSet<CommonSlice & OraclesSlice>,
  get: GetState<CommonSlice & OraclesSlice>,
): CommonSlice => ({
  // ------------------
  // VARIABLES
  // ------------------
  assetParams: [],
  baseCurrency: {
    denom: 'uosmo',
    symbol: 'OSMO',
    decimals: 6,
  },
  currencyAssets: [],
  currentNetwork: SUPPORTED_CHAINS[0].chainId,
  errors: {
    network: false,
    query: false,
    server: false,
  },
  isLedger: false,
  latestBlockHeight: 0,
  networkConfig: getNetworkConfig(SUPPORTED_CHAINS[0].chainId),
  marketDeposits: [],
  marketDebts: [],
  otherAssets: [],
  queryErrors: [],
  acceptedTermsOfService: false,
  slippage: 0.02,
  tutorialSteps: { redbank: 1, fields: 1 },
  userBalances: [],
  userMarsTokenBalances: [],
  userUnclaimedRewards: [],
  userWalletAddress: '',
  vaultConfigs: [],
  whitelistedAssets: [],
  // ------------------
  // GENERAL FUNCTIONS
  // ------------------
  convertToBaseCurrency: (coin: Coin) => {
    const exchangeRates = get().exchangeRates
    const assetPricesUSD = get().assetPricesUSD
    const baseCurrency = get().baseCurrency
    const assets = [...get().whitelistedAssets, ...get().otherAssets]
    const asset = assets.find((asset) => asset.denom === coin.denom)

    if (!exchangeRates || !assetPricesUSD || !coin || !asset) return 0

    const additionalDecimals = asset.decimals - baseCurrency.decimals

    if (coin.denom === baseCurrency.denom) return new BigNumber(coin.amount).toNumber()

    const baseAssetPrice = assetPricesUSD?.find(
      (assetPrice) => assetPrice.denom === baseCurrency.denom,
    )?.amount
    const assetPrice = assetPricesUSD?.find((assetPrice) => assetPrice.denom === coin.denom)?.amount
    if (!baseAssetPrice || !assetPrice) return 0

    return demagnify(
      new BigNumber(coin.amount).times(assetPrice).dividedBy(baseAssetPrice).toNumber(),
      additionalDecimals,
    )
  },
  convertValueToAmount: (coin: Coin) => {
    const exchangeRates = get().exchangeRates
    const baseCurrency = get().baseCurrency
    const whitelistedAssets = get().whitelistedAssets

    const asset = whitelistedAssets.find((asset) => asset.denom === coin.denom)
    const additionalDecimals = (asset?.decimals || 6) - baseCurrency.decimals

    if (!exchangeRates || !coin) return 0

    const exchangeRate = exchangeRates?.find(
      (exchangeRate) => exchangeRate.denom === coin.denom,
    )?.amount

    const baseExchangeRate = exchangeRates?.find(
      (exchangeRate) => exchangeRate.denom === baseCurrency.denom,
    )?.amount
    if (!exchangeRate || !baseExchangeRate) return 0

    return magnify(
      new BigNumber(coin.amount).div(exchangeRate).times(baseExchangeRate).toNumber(),
      additionalDecimals,
    )
  },
  executeMsg: async (
    options: StrategyExecuteMsgOptions,
  ): Promise<TxBroadcastResult | undefined> => {
    const client = get().client!
    const networkConfig = get().networkConfig
    const baseCurrencyDenom = networkConfig.assets.base.denom
    const pythContractAddress = networkConfig.contracts?.pyth
    const pythVaaMessage = getPythVaaMessage(
      get().pythVaa,
      baseCurrencyDenom,
      get().isLedger,
      pythContractAddress,
      get().userWalletAddress,
    )

    if (!options.sender) options.sender = get().userWalletAddress

    const messages = [
      new MsgExecuteContract({
        sender: options.sender,
        contract: options.contract,
        msg: options.msg,
        funds: options.funds,
      }),
    ]

    if (pythVaaMessage) messages.unshift(pythVaaMessage)

    const broadcastOptions = {
      messages,
      feeAmount: options.fee.amount[0].amount,
      gasLimit: options.fee.gas,
      memo: undefined,
      wallet: client.connectedWallet,
      mobile: isMobile,
    }

    try {
      return client.broadcast(broadcastOptions)
    } catch (e) {
      console.error('transaction', e)
    }
  },
  getAdditionalDecimals: (denom: string) => {
    const assets = [...get().whitelistedAssets, ...get().otherAssets]
    const assetDecimals = assets.find((asset) => asset.denom === denom)?.decimals
    const baseCurrencyDecimals = get().baseCurrency.decimals
    if (!assetDecimals) return 0

    return assetDecimals - baseCurrencyDecimals
  },
  loadNetworkConfig: () => {
    const networkConfig = getNetworkConfig(get().currentNetwork)
    const vaultConfig = getNetworkVaultConfig(get().currentNetwork)

    networkConfig.hiveUrl = serializeUrl(networkConfig.hiveUrl)
    networkConfig.rpcUrl = serializeUrl(networkConfig.rpcUrl)
    networkConfig.restUrl = serializeUrl(networkConfig.restUrl)

    const storageDisplayCurrency = localStorage.getItem(DISPLAY_CURRENCY_KEY)
    if (storageDisplayCurrency) {
      const displayCurrency = networkConfig.assets.currencies.find(
        (currency) => currency.denom === JSON.parse(storageDisplayCurrency).denom,
      )
      if (displayCurrency) {
        networkConfig.displayCurrency = JSON.parse(storageDisplayCurrency)
      } else {
        localStorage.setItem(DISPLAY_CURRENCY_KEY, JSON.stringify(networkConfig.displayCurrency))
      }
    }

    set({
      networkConfig: networkConfig,
      otherAssets: networkConfig.assets.other,
      whitelistedAssets: networkConfig.assets.whitelist,
      currencyAssets: networkConfig.assets.currencies,
      vaultConfigs: vaultConfig,
      baseCurrency: networkConfig.assets.base,
      marketDebts: [],
      marketDeposits: [],
      userBalances: [],
      userMarsTokenBalances: [],
      userUnclaimedRewards: [],
    })
  },
  queryContract: async <T>(contractAddress: string, queryMsg: object, retries = 3) => {
    let attempts = 0
    while (attempts < retries) {
      const lcdClient = get().lcdClient
      if (!lcdClient) return
      try {
        return await lcdClient.get(contractAddress, queryMsg)
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
    chainInfo.rpc = serializeUrl(get().networkConfig.rpcUrl)
    chainInfo.rest = serializeUrl(get().networkConfig.restUrl)
    set({ chainInfo })
  },
  setCurrentNetwork: (network: ChainInfoID) => set({ currentNetwork: network }),
  setNetworkError: (isError: boolean) => {
    const errors = get().errors
    if (isError !== errors.network) {
      errors.network = isError
      set({ errors })
    }
  },
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
      amount: data.mdwasmkey[`${asset.id}Deposits`],
      denom: asset.denom,
    }))

    const debtCoins: Coin[] = whitelistedAssets.map((asset) => ({
      amount: data.mdwasmkey[`${asset.id}Debt`],
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
