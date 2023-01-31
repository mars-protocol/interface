import { useAvailableVault } from 'hooks/data'
import { useRouter } from 'next/router'
import React, { useRef } from 'react'
import useStore from 'store'

import SetupPosition from './SetupPosition'

const Setup = () => {
  const position = useStore((s) => s.position)
  const vaultConfigs = useStore((s) => s.vaultConfigs)
  const router = useRouter()
  const vaultAddress = String(router.query.address)
  const availableVault = useAvailableVault(vaultAddress)
  const isValidVault = vaultConfigs.find((vault) => vault.address === vaultAddress)

  const ref = useRef(availableVault)

  if (!ref.current && availableVault) {
    ref.current = availableVault
  }

  if (!isValidVault || !position || !ref.current) {
    router.replace(`/farm/vault/${vaultAddress}/create`)
    return
  }

  return <SetupPosition availableVault={ref.current} position={position} />
}

export default Setup
