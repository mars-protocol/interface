import React, { ReactNode, useEffect } from 'react'
import useStore from 'store'
import { AccountNftClient, CreditManagerClient } from 'types/classes'

interface FieldsContainerProps {
  children: ReactNode
}

export const FieldsContainer = ({ children }: FieldsContainerProps) => {
  const client = useStore((s) => s.client)
  const networkConfig = useStore((s) => s.networkConfig)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const setCreditManagerMsgComposer = useStore((s) => s.setCreditManagerMsgComposer)

  useEffect(() => {
    if (!client || !networkConfig) return
    useStore.setState({
      creditManagerClient: new CreditManagerClient(networkConfig?.contracts.creditManager, client),
    })
    useStore.setState({
      accountNftClient: new AccountNftClient(networkConfig?.contracts.accountNft, client),
    })
  }, [client, networkConfig])

  useEffect(() => {
    if (!userWalletAddress || !networkConfig?.contracts.creditManager) return
    setCreditManagerMsgComposer(userWalletAddress, networkConfig.contracts.creditManager)
  }, [userWalletAddress, networkConfig, setCreditManagerMsgComposer])

  return <>{children}</>
}
