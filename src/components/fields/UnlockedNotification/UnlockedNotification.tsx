import { Button, Notification } from 'components/common'
import { useRouter } from 'next/router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { NotificationType } from 'types/enums'

import styles from './UnlockedNotification.module.scss'

export const UnlockedNotification = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const activeVaults = useStore((s) => s.activeVaults)

  const vaultsUnlocked = activeVaults.filter(
    (activeVault) =>
      activeVault && activeVault.position.status === 'unlocked' && activeVault.position.id,
  )

  if (!vaultsUnlocked.length) return null

  const exitVaultHandler = () => {
    router.push(`/farm/vault/${vaultsUnlocked[0].address}/close`)
  }

  const unlockedContent = () => {
    if (vaultsUnlocked.length === 1) {
      return (
        <div className={styles.container}>
          <span>
            {t('fields.notifications.unlocked.single.text', {
              lp: vaultsUnlocked[0].name.name,
            })}
          </span>
          <Button
            onClick={exitVaultHandler}
            color='tertiary'
            text={t('fields.notifications.unlocked.single.button')}
          ></Button>
        </div>
      )
    } else {
      return (
        <div className={styles.container}>
          <span>{t('fields.notifications.unlocked.plural')}</span>
        </div>
      )
    }
  }

  return (
    <Notification
      type={NotificationType.Warning}
      content={unlockedContent()}
      showNotification
      hideCloseBtn
    ></Notification>
  )
}
