import { useActiveVault } from 'hooks/data'
import { useRouter } from 'next/router'
import React from 'react'

import EditVault from './EditVault'

const Edit = () => {
  const router = useRouter()

  const vaultAddress = String(router.query.address)
  const activeVault = useActiveVault(vaultAddress)

  if (!activeVault) return <></>

  return <EditVault activeVault={activeVault} />
}

export default Edit
