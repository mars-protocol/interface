import { Notification } from 'components/common'
import { produceCountdown } from 'libs/parse'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { NotificationType } from 'types/enums'

import styles from './UnlockingNotification.module.scss'

export const UnlockingNotification = () => {
  const { t } = useTranslation()
  const activeVaults = useStore((s) => s.activeVaults)
  const [timeLeft, setTimeLeft] = useState<string>()
  const getVaults = useStore((s) => s.getVaults)

  const vaultsUnlocking = activeVaults.filter(
    (activeVault) => activeVault && activeVault.position.status === 'unlocking',
  )

  useEffect(() => {
    if ((vaultsUnlocking?.length || 0) < 1) return

    const updateCountdown = () => {
      const remainingTime =
        (vaultsUnlocking[0].position.unlockAtTimestamp || 0) - new Date().getTime()
      if (remainingTime <= 0) {
        getVaults({ refetch: true })
      }
      setTimeLeft(produceCountdown(remainingTime))
    }

    updateCountdown()

    const interval = setInterval(() => {
      updateCountdown()
    }, 1000 * 5)

    return () => clearInterval(interval)
  }, [vaultsUnlocking, getVaults])

  if (!activeVaults.length) return null

  if (!vaultsUnlocking.length) return null

  const unlockedContent = () => {
    if (vaultsUnlocking.length === 1) {
      return (
        <div className={styles.container}>
          <span>
            {t('fields.notifications.unlocking.single', {
              lp: vaultsUnlocking[0].name,
              time: timeLeft,
            })}
          </span>
        </div>
      )
    } else {
      return (
        <div className={styles.container}>
          <span>{t('fields.notifications.unlocking.plural')}</span>
        </div>
      )
    }
  }

  return (
    <Notification
      type={NotificationType.Info}
      content={unlockedContent()}
      showNotification
      hideCloseBtn
    ></Notification>
  )
}
