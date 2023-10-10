import { useVaultParams } from 'hooks/queries/useVaultParams'
import { ReactNode, useEffect } from 'react'
import useStore from 'store'
import { AccountNftClient, CreditManagerClient } from 'types/classes'

interface FieldsContainerProps {
  children: ReactNode
}

export const FieldsContainer = ({ children }: FieldsContainerProps) => {
  const { data: vaultParams } = useVaultParams()
  const client = useStore((s) => s.client)
  const currentNetwork = useStore((s) => s.currentNetwork)
  const networkConfig = useStore((s) => s.networkConfig)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const getVaults = useStore((s) => s.getVaults)
  const setCreditManagerMsgComposer = useStore((s) => s.setCreditManagerMsgComposer)

  const creditManagerAddress = networkConfig.contracts.creditManager
  const accountNftContractAddress = networkConfig.contracts.accountNft

  useEffect(() => {
    if (!networkConfig.isFieldsEnabled || !creditManagerAddress || !accountNftContractAddress)
      return

    if (!client || client.connectedWallet.network.chainId !== currentNetwork) return
    useStore.setState({
      creditManagerClient: new CreditManagerClient(creditManagerAddress, client),
      accountNftClient: new AccountNftClient(accountNftContractAddress, client),
      apys: null,
    })

    getVaults({ refetch: true })
  }, [
    client,
    networkConfig,
    accountNftContractAddress,
    creditManagerAddress,
    currentNetwork,
    getVaults,
    vaultParams,
  ])

  useEffect(() => {
    if (!userWalletAddress || !networkConfig.contracts.creditManager) return
    setCreditManagerMsgComposer(userWalletAddress, networkConfig.contracts.creditManager)
  }, [userWalletAddress, networkConfig.contracts.creditManager, setCreditManagerMsgComposer])

  return <>{children}</>
}
