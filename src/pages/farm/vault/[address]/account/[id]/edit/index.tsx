import { useActiveVault } from 'hooks/data'
import { useRouter } from 'next/router'
import React from 'react'

import EditVault from './EditVault'

const Edit = () => {
  const router = useRouter()

  const accountId = String(router.query.id)
  const activeVault = useActiveVault(accountId)

  if (!activeVault) return <></>

  return <EditVault activeVault={activeVault} />
}

export default Edit
