import { MigrationInProgress } from 'components/common'
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
import { getCurrentChainId } from 'libs/chainId'
import { getNetworkConfig, getNetworkVaultConfig } from 'libs/networkConfig'
import { ReactNode, useEffect } from 'react'
import useStore from 'store'
import { State } from 'types/enums'
import { ChainInfoID } from 'types/enums/wallet'

interface CommonContainerProps {
  children: ReactNode
}

export const CommonContainer = ({ children }: CommonContainerProps) => {
  // ------------------
  // STORE STATE
  // ------------------
  const assetPricesUSDState = useStore((s) => s.assetPricesUSDState)
  const assetPricesUSD = useStore((s) => s.assetPricesUSD)
  const chainId = useStore((s) => s.currentNetwork)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const exchangeRatesState = useStore((s) => s.exchangeRatesState)
  const marketDeposits = useStore((s) => s.marketDeposits)
  const marketInfo = useStore((s) => s.marketInfo)
  const migrationInProgress = useStore((s) => s.migrationInProgress)
  const redBankState = useStore((s) => s.redBankState)
  const rpc = useStore((s) => s.networkConfig.rpcUrl)
  const userBalances = useStore((s) => s.userBalances)
  const userBalancesState = useStore((s) => s.userBalancesState)
  const userDebts = useStore((s) => s.userDebts)
  const currentNetwork = useStore((s) => s.currentNetwork)
  const userDeposits = useStore((s) => s.userDeposits)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const whitelistedAssets = useStore((s) => s.networkConfig.assets.whitelist)
  const setRedBankAssets = useStore((s) => s.setRedBankAssets)
  const setLcdClient = useStore((s) => s.setLcdClient)
  const setUserBalancesState = useStore((s) => s.setUserBalancesState)

  // ------------------
  // SETTERS
  // ------------------
  useEffect(() => {
    if (!rpc || !chainId) return
    setLcdClient(rpc, chainId)
  }, [rpc, chainId, setLcdClient])

  useEffect(() => {
    const currentChainId = getCurrentChainId()
    useStore.setState({
      networkConfig: getNetworkConfig(currentChainId),
      vaultConfigs: getNetworkVaultConfig(currentChainId),
      currentNetwork: currentChainId as ChainInfoID,
    })
  }, [])

  useEffect(() => {
    if (userBalances) {
      setUserBalancesState(State.READY)
    } else {
      setUserBalancesState(State.ERROR)
    }
  }, [userWalletAddress, userDebts, userDeposits, userBalances, setUserBalancesState])

  useEffect(() => {
    setRedBankAssets()
  }, [
    assetPricesUSD,
    assetPricesUSDState,
    exchangeRatesState,
    redBankState,
    userBalancesState,
    exchangeRates,
    currentNetwork,
    marketInfo,
    userDebts,
    userDeposits,
    whitelistedAssets,
    marketDeposits,
    userWalletAddress,
    setRedBankAssets,
  ])

  // ------------------
  // QUERY RELATED
  // ------------------
  useAssetParams()
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
