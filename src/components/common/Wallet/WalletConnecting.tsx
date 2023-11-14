import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useShuttle } from '@delphi-labs/shuttle-react'
import { CircularProgress, Modal } from 'components/common'
import { CHAINS } from 'constants/chains'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useStore from 'store'
import { State } from 'types/enums'
import { MarsParamsQueryClient } from 'types/generated/mars-params/MarsParams.client'

export const WalletConnecting = () => {
  const {
    recentWallet,
    connect,
    mobileConnect,
    simulate,
    sign,
    broadcast,
    mobileProviders,
    extensionProviders,
  } = useShuttle()
  const providers = useMemo(
    () => [...mobileProviders, ...extensionProviders],
    [mobileProviders, extensionProviders],
  )
  const [isConnecting, setIsConnecting] = useState(false)
  const networkConfig = useStore((s) => s.networkConfig)
  const walletConnecting = useStore((s) => s.walletConnecting)
  const currentWallet = useCurrentWallet()
  const providerId = walletConnecting?.providerId ?? currentWallet?.providerId
  const client = useStore((s) => s.client)
  const address = useStore((s) => s.userWalletAddress)
  const currentChainId = useMemo(() => networkConfig.name, [networkConfig.name])

  const handleConnect = useCallback(
    (extensionProviderId: string) => {
      async function handleConnectAsync() {
        if (client || isConnecting) return
        setIsConnecting(true)
        try {
          const response = await connect({ extensionProviderId, chainId: currentChainId })
          const cosmClient = await CosmWasmClient.connect(response.network.rpc)
          const walletClient: WalletClient = {
            broadcast,
            cosmWasmClient: cosmClient,
            connectedWallet: response,
            sign,
            simulate,
          }
          const paramsClient = networkConfig.contracts.params
            ? new MarsParamsQueryClient(cosmClient, networkConfig.contracts.params)
            : undefined
          setIsConnecting(false)
          useStore.setState({
            client: walletClient,
            userWalletAddress: response.account.address,
            walletConnecting: undefined,
            userIcns: undefined,
            paramsClient: paramsClient,
            chainInfo: CHAINS[currentChainId],
            userBalancesState: State.INITIALISING,
          })
        } catch (error) {
          setIsConnecting(false)
          if (error instanceof Error) {
            useStore.setState({
              client: undefined,
              userWalletAddress: undefined,
              walletConnecting: undefined,
              chainInfo: undefined,
            })
          }
        }
      }
      if (!isConnecting) handleConnectAsync()
    },
    [
      broadcast,
      connect,
      client,
      isConnecting,
      setIsConnecting,
      sign,
      simulate,
      currentChainId,
      networkConfig.contracts.params,
    ],
  )

  const handleMobileConnect = useCallback(
    (mobileProviderId: string) => {
      async function handleMobileConnectAsync() {
        if (client || isConnecting || !recentWallet) return
        setIsConnecting(true)
        try {
          await mobileConnect({ mobileProviderId, chainId: currentChainId })
          const cosmClient = await CosmWasmClient.connect(networkConfig.rpcUrl)
          const walletClient: WalletClient = {
            broadcast,
            cosmWasmClient: cosmClient,
            connectedWallet: recentWallet,
            sign,
            simulate,
          }
          const paramsClient = networkConfig.contracts.params
            ? new MarsParamsQueryClient(cosmClient, networkConfig.contracts.params)
            : undefined

          setIsConnecting(false)
          useStore.setState({
            client: walletClient,
            userWalletAddress: recentWallet.account.address,
            walletConnecting: undefined,
            userIcns: undefined,
            paramsClient: paramsClient,
            chainInfo: CHAINS[currentChainId],
            userBalancesState: State.INITIALISING,
          })
        } catch (error) {
          setIsConnecting(false)
          if (error instanceof Error) {
            useStore.setState({
              client: undefined,
              userWalletAddress: undefined,
              walletConnecting: undefined,
              chainInfo: undefined,
            })
          }
        }
      }
      if (!isConnecting) handleMobileConnectAsync()
    },
    [
      mobileConnect,
      client,
      isConnecting,
      recentWallet,
      sign,
      simulate,
      currentChainId,
      broadcast,
      networkConfig.contracts.params,
      networkConfig.rpcUrl,
    ],
  )

  useEffect(() => {
    if (!providerId) {
      useStore.setState({
        client: undefined,
        userWalletAddress: undefined,
        walletConnecting: undefined,
        chainInfo: undefined,
      })
      return
    }
    const provider = providers.find((p) => p.id === providerId)
    if (
      !provider?.id ||
      isConnecting ||
      (recentWallet && recentWallet.account.address === address)
    ) {
      return
    }

    const isMobileProvider = provider.id.split('-')[0] === 'mobile'
    if (isMobileProvider) {
      handleMobileConnect(provider.id)
      return
    }
    handleConnect(provider.id)
  }, [
    handleConnect,
    isConnecting,
    providerId,
    providers,
    recentWallet,
    address,
    handleMobileConnect,
  ])

  if (!walletConnecting?.show) return null

  return (
    <Modal
      onClose={() => useStore.setState({ walletConnecting: undefined, showWalletSelect: true })}
      title={'Connecting...'}
      copy={'Unlock your wallet and approve the connection'}
    >
      <CircularProgress size={40} />
    </Modal>
  )
}
