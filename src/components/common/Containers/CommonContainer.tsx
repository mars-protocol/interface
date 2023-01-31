import { useWallet } from '@marsprotocol/wallet-connector'
import { useQueryClient } from '@tanstack/react-query'
import { MARS_SYMBOL, USDC_SYMBOL } from 'constants/appConstants'
import {
  useBlockHeight,
  useMarketDeposits,
  useMarsOracle,
  useRedBank,
  useUserBalance,
  useUserDebt,
  useUserDeposit,
} from 'hooks/queries'
import { useSpotPrice } from 'hooks/queries/useSpotPrice'
import { ReactNode, useEffect } from 'react'
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
  const { chainInfo, address, signingCosmWasmClient, name } = useWallet()
  const queryClient = useQueryClient()

  // ------------------
  // STORE STATE
  // ------------------
  const chainID = useStore((s) => s.chainInfo?.chainId)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const exchangeRatesState = useStore((s) => s.exchangeRatesState)
  const isNetworkLoaded = useStore((s) => s.isNetworkLoaded)
  const rpc = useStore((s) => s.chainInfo?.rpc)
  const marketAssetLiquidity = useStore((s) => s.marketAssetLiquidity)
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
  const setUserWalletName = useStore((s) => s.setUserWalletName)

  // ------------------
  // SETTERS
  // ------------------
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_NETWORK === 'mainnet') {
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
    if (!name) return
    setUserWalletName(name)
  }, [setUserWalletName, name])

  useEffect(() => {
    if (!rpc || !chainID) return
    setLcdClient(rpc, chainID)
  }, [rpc, chainID, setLcdClient])

  useEffect(() => {
    if (!signingCosmWasmClient) return
    setClient(signingCosmWasmClient)
  }, [signingCosmWasmClient, setClient])

  useEffect(() => {
    if (userDebts && userDeposits && userBalances) {
      setUserBalancesState(State.READY)
    } else {
      setUserBalancesState(State.ERROR)
    }
  }, [userDebts, userDeposits, userBalances, setUserBalancesState])

  useEffect(() => {
    setRedBankAssets()
  }, [
    exchangeRatesState,
    redBankState,
    userBalancesState,
    exchangeRates,
    marketInfo,
    marketAssetLiquidity,
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
  useUserDeposit()
  useUserDebt()
  useMarsOracle()
  useSpotPrice(MARS_SYMBOL)
  useSpotPrice(USDC_SYMBOL)
  useMarketDeposits()
  useRedBank()

  return <>{isNetworkLoaded && children}</>
}
