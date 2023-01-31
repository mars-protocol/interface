import React, { ReactNode, useEffect } from 'react'
import useStore from 'store'

interface FieldsContainerProps {
  children: ReactNode
}

export const FieldsContainer = ({ children }: FieldsContainerProps) => {
  const client = useStore((s) => s.client)
  const networkConfig = useStore((s) => s.networkConfig)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const setAccountNftClient = useStore((s) => s.setAccountNftClient)
  const setCreditManagerClient = useStore((s) => s.setCreditManagerClient)
  const setCreditManagerMsgComposer = useStore((s) => s.setCreditManagerMsgComposer)

  useEffect(() => {
    if (!client) return
    setAccountNftClient(client)
    setCreditManagerClient(client)
  }, [client, setAccountNftClient, setCreditManagerClient])

  useEffect(() => {
    if (!userWalletAddress || !networkConfig?.contracts.creditManager) return
    setCreditManagerMsgComposer(userWalletAddress, networkConfig.contracts.creditManager)
  }, [userWalletAddress, networkConfig, setCreditManagerMsgComposer])

  return <>{children}</>
}
