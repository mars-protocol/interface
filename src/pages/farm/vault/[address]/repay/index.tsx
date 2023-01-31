import { useActiveVault } from 'hooks/data'
import { useRouter } from 'next/router'
import React from 'react'

import RepayVault from './RepayVault'

const Repay = () => {
  const router = useRouter()

  const vaultAddress = String(router.query.address)
  const activeVault = useActiveVault(vaultAddress)

  if (!activeVault) return <></>

  return <RepayVault activeVault={activeVault} />
}

export default Repay
