import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import {
  ChainInfoID,
  getChainInfo,
  getClient,
  useWallet,
  useWalletManager,
  WalletConnectionStatus,
} from '@marsprotocol/wallet-connector'
import { useQueryClient } from '@tanstack/react-query'
import { MARS_SYMBOL } from 'constants/appConstants'
import { NETWORK } from 'constants/env'
import {
  useBlockHeight,
  useDepositAndDebt,
  useMarsOracle,
  useRedBank,
  useUsdPrice,
  useUserBalance,
  useUserDebt,
  useUserDeposit,
  useUserIcns,
} from 'hooks/queries'
import { useSpotPrice } from 'hooks/queries/useSpotPrice'
import { ReactNode, useEffect, useState } from 'react'
import useStore from 'store'
import { State } from 'types/enums'
import { Network } from 'types/enums/network'

interface CommonContainerProps {
  children: ReactNode
}

export const CommonContainer = ({ children }: CommonContainerProps) => {
  // ------------------
  // EXTERNAL HOOKS
  // ---------------
  const { recentWallet, simulate, sign, broadcast } = useWallet()
  const { status } = useWalletManager()
  const queryClient = useQueryClient()

  const chainInfo = recentWallet?.network
    ? getChainInfo(recentWallet?.network.chainId as ChainInfoID)
    : undefined
  const address = status !== WalletConnectionStatus.Connected ? '' : recentWallet?.account.address

  const [cosmWasmClient, setCosmWasmClient] = useState<CosmWasmClient | undefined>()

  // ------------------
  // STORE STATE
  // ------------------
  const chainID = useStore((s) => s.chainInfo?.chainId)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const exchangeRatesState = useStore((s) => s.exchangeRatesState)
  const isNetworkLoaded = useStore((s) => s.isNetworkLoaded)
  const rpc = useStore((s) => s.chainInfo?.rpc)
  const marketDeposits = useStore((s) => s.marketDeposits)
  const marketInfo = useStore((s) => s.marketInfo)
  const marketIncentiveInfo = useStore((s) => s.marketIncentiveInfo)
  const redBankState = useStore((s) => s.redBankState)
  const userBalances = useStore((s) => s.userBalances)
  const userBalancesState = useStore((s) => s.userBalancesState)
  const userDebts = useStore((s) => s.userDebts)
  const userDeposits = useStore((s) => s.userDeposits)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)
  const loadNetworkConfig = useStore((s) => s.loadNetworkConfig)
  const setRedBankAssets = useStore((s) => s.setRedBankAssets)
  const setChainInfo = useStore((s) => s.setChainInfo)
  const setCurrentNetwork = useStore((s) => s.setCurrentNetwork)
  const setLcdClient = useStore((s) => s.setLcdClient)
  const setClient = useStore((s) => s.setClient)
  const setUserBalancesState = useStore((s) => s.setUserBalancesState)
  const setUserWalletAddress = useStore((s) => s.setUserWalletAddress)

  // ------------------
  // SETTERS
  // ------------------
  useEffect(() => {
    if (NETWORK === 'mainnet') {
      setCurrentNetwork(Network.MAINNET)
    }
    loadNetworkConfig()
  }, [loadNetworkConfig, setCurrentNetwork])

  useEffect(() => {
    if (!chainInfo) return
    setChainInfo(chainInfo)
  }, [chainInfo, setChainInfo])

  useEffect(() => {
    setUserWalletAddress(address || '')
  }, [setUserWalletAddress, address])

  useEffect(() => {
    if (!rpc || !chainID) return
    setLcdClient(rpc, chainID)
  }, [rpc, chainID, setLcdClient])

  useEffect(() => {
    if (userDebts && userDeposits && userBalances) {
      setUserBalancesState(State.READY)
    } else {
      setUserBalancesState(State.ERROR)
    }
  }, [userDebts, userDeposits, userBalances, setUserBalancesState])

  useEffect(() => {
    if (!recentWallet) return
    if (!cosmWasmClient) {
      const getCosmWasmClient = async () => {
        const cosmClient = await getClient(recentWallet.network.rpc)
        setCosmWasmClient(cosmClient)
      }

      getCosmWasmClient()
      return
    }

    const client = {
      broadcast,
      cosmWasmClient,
      recentWallet,
      sign,
      simulate,
    }
    setClient(client)
  }, [simulate, sign, recentWallet, cosmWasmClient, broadcast, setClient])

  useEffect(() => {
    setRedBankAssets()
  }, [
    exchangeRatesState,
    redBankState,
    userBalancesState,
    exchangeRates,
    marketInfo,
    marketIncentiveInfo,
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
  useBlockHeight()
  useRedBank()
  useUserBalance()
  useUserIcns()
  useUserDeposit()
  useUserDebt()
  useMarsOracle()
  useSpotPrice(MARS_SYMBOL)
  useUsdPrice()
  useDepositAndDebt()
  useRedBank()

  return <>{isNetworkLoaded && children}</>
}
