import { useActiveVault } from 'hooks/data'
import { useRouter } from 'next/router'
import React from 'react'

import RepayVault from './RepayVault'

const Repay = () => {
  const router = useRouter()

  const accountId = String(router.query.id)
  const activeVault = useActiveVault(accountId)

  if (!activeVault) return <></>

  return <RepayVault activeVault={activeVault} />
}

export default Repay
