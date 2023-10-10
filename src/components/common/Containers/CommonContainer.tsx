import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import {
  getChainInfo,
  getClient,
  useWallet,
  useWalletManager,
  WalletConnectionStatus,
} from '@marsprotocol/wallet-connector'
import { useQueryClient } from '@tanstack/react-query'
import {
  useBlockHeight,
  useDepositAndDebt,
  useMarsOracle,
  useRedBank,
  useUsdPrice,
  useUserBalance,
  useUserDebt,
  useUserIcns,
} from 'hooks/queries'
import { useAssetParams } from 'hooks/queries/useAssetParams'
import { useMarsPrice } from 'hooks/queries/useMarsPrice'
import { usePythVaa } from 'hooks/queries/usePythVaa'
import { useUserCollaterals } from 'hooks/queries/useUserCollaterals'
import { ReactNode, useEffect, useState } from 'react'
import useStore from 'store'
import { State } from 'types/enums'
import { MarsParamsQueryClient } from 'types/generated/mars-params/MarsParams.client'

import { MigrationInProgress } from '../MigrationInProgress/MigrationInProgress'

interface CommonContainerProps {
  children: ReactNode
}

export const CommonContainer = ({ children }: CommonContainerProps) => {
  useAssetParams()

  // ------------------
  // EXTERNAL HOOKS
  // ---------------
  const { simulate, sign, broadcast } = useWallet()
  const { status, connectedWallet } = useWalletManager()
  const queryClient = useQueryClient()

  const [cosmWasmClient, setCosmWasmClient] = useState<CosmWasmClient | undefined>()

  // ------------------
  // STORE STATE
  // ------------------
  const assetPricesUSDState = useStore((s) => s.assetPricesUSDState)
  const assetPricesUSD = useStore((s) => s.assetPricesUSD)
  const chainId = useStore((s) => s.currentNetwork)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const exchangeRatesState = useStore((s) => s.exchangeRatesState)
  const networkConfig = useStore((s) => s.networkConfig)
  const marketDeposits = useStore((s) => s.marketDeposits)
  const marketInfo = useStore((s) => s.marketInfo)
  const migrationInProgress = useStore((s) => s.migrationInProgress)
  const paramsAddress = useStore((s) => s.networkConfig.contracts.params)
  const redBankState = useStore((s) => s.redBankState)
  const rpc = useStore((s) => s.networkConfig.rpcUrl)
  const userBalances = useStore((s) => s.userBalances)
  const userBalancesState = useStore((s) => s.userBalancesState)
  const userDebts = useStore((s) => s.userDebts)
  const userDeposits = useStore((s) => s.userDeposits)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)
  const setRedBankAssets = useStore((s) => s.setRedBankAssets)
  const setLcdClient = useStore((s) => s.setLcdClient)
  const setChainInfo = useStore((s) => s.setChainInfo)
  const setUserBalancesState = useStore((s) => s.setUserBalancesState)

  // ------------------
  // SETTERS
  // ------------------

  useEffect(() => {
    if (status !== WalletConnectionStatus.Connected && cosmWasmClient) {
      setCosmWasmClient(undefined)
      useStore.setState({
        client: undefined,
        creditManagerClient: undefined,
        accountNftClient: undefined,
        paramsClient: undefined,
        userWalletAddress: '',
      })
    }
  }, [status, cosmWasmClient])

  useEffect(() => {
    const chainInfo = getChainInfo(chainId, {
      rpc: networkConfig.rpcUrl,
      rest: networkConfig.restUrl,
    })
    setChainInfo(chainInfo)
  }, [chainId, networkConfig, setChainInfo])

  useEffect(() => {
    if (!connectedWallet || connectedWallet.network.chainId !== chainId) return
    useStore.setState({
      userWalletAddress: connectedWallet.account.address,
      isLedger: connectedWallet.account.isLedger,
    })
  }, [connectedWallet, chainId])

  useEffect(() => {
    if (!rpc || !chainId) return
    setLcdClient(rpc, chainId)
  }, [rpc, chainId, setLcdClient])

  useEffect(() => {
    if (userBalances) {
      setUserBalancesState(State.READY)
    } else {
      setUserBalancesState(State.ERROR)
    }
  }, [userDebts, userDeposits, userBalances, setUserBalancesState])

  useEffect(() => {
    if (!connectedWallet || connectedWallet.network.chainId !== chainId) return
    if (!cosmWasmClient) {
      const getCosmWasmClient = async () => {
        const cosmClient = await getClient(networkConfig.rpcUrl)
        setCosmWasmClient(cosmClient)
      }

      getCosmWasmClient()
      return
    }

    useStore.setState({
      client: {
        broadcast,
        cosmWasmClient,
        connectedWallet,
        sign,
        simulate,
      },
    })
  }, [simulate, sign, connectedWallet, cosmWasmClient, broadcast, networkConfig, chainId])

  useEffect(() => {
    if (!paramsAddress || !cosmWasmClient) return
    useStore.setState({ paramsClient: new MarsParamsQueryClient(cosmWasmClient, paramsAddress) })
  }, [cosmWasmClient, paramsAddress])

  useEffect(() => {
    setRedBankAssets()
  }, [
    assetPricesUSD,
    assetPricesUSDState,
    exchangeRatesState,
    redBankState,
    userBalancesState,
    exchangeRates,
    marketInfo,
    userDebts,
    userDeposits,
    whitelistedAssets,
    marketDeposits,
    setRedBankAssets,
  ])

  useEffect(() => {
    queryClient.removeQueries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userWalletAddress])

  // ------------------
  // QUERY RELATED
  // ------------------
  useUsdPrice()
  useBlockHeight()
  useUserBalance()
  useUserIcns()
  useUserDebt()
  useUserCollaterals()
  useMarsOracle()
  useMarsPrice()
  useDepositAndDebt()
  useRedBank()
  usePythVaa()

  if (migrationInProgress) return <MigrationInProgress />

  return <>{children}</>
}
