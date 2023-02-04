import {
  ActiveVaults,
  AvailableVaults,
  LiquidationNotification,
  UnlockedNotification,
  UnlockingNotification,
} from 'components/fields'
import { FIELDS_FEATURE } from 'constants/appConstants'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useStore from 'store'

import styles from './Fields.module.scss'

let prefUserWalletAddress = ''

const Fields = () => {
  const router = useRouter()
  const client = useStore((s) => s.client)
  const accountNftClient = useStore((s) => s.accountNftClient)
  const creditManagerClient = useStore((s) => s.creditManagerClient)
  const getVaults = useStore((s) => s.getVaults)
  const userWalletAddress = useStore((s) => s.userWalletAddress)

  useEffect(() => {
    if (!getVaults || !accountNftClient || !client || !creditManagerClient || !userWalletAddress)
      return
    if (userWalletAddress && prefUserWalletAddress !== userWalletAddress) {
      prefUserWalletAddress = userWalletAddress
      getVaults({ refetch: true })
    } else {
      getVaults()
    }
  }, [getVaults, client, accountNftClient, creditManagerClient, userWalletAddress])

  useEffect(() => {
    if (!FIELDS_FEATURE) {
      router.push('/')
    }
  })

  return (
    <div className={styles.container}>
      <LiquidationNotification />
      <UnlockingNotification />
      <UnlockedNotification />
      <ActiveVaults />
      <AvailableVaults />
    </div>
  )
}

export default Fields
