import { Button, Notification } from 'components/common'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { NotificationType } from 'types/enums'

import styles from './LiquidationNotification.module.scss'

export const LiquidationNotification = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const activeVaults = useStore((s) => s.activeVaults)

  const elligiblePositions = activeVaults.filter((vault) => vault.position.ltv > vault.ltv.contract)

  const repayHandler = (address: string, accountId: string) => {
    router.push(`/farm/vault/${address}/account/${accountId}/repay`)
    return
  }

  if (!elligiblePositions.length) return null

  if (elligiblePositions.length >= 1) {
    return (
      <Notification
        type={NotificationType.Warning}
        content={
          <>
            <div className={styles.container}>
              <span>
                {t('fields.notifications.liquidation.single.text', {
                  lp: elligiblePositions[0].name.name,
                })}
              </span>
              <Button
                onClick={() =>
                  repayHandler(
                    elligiblePositions[0].address,
                    elligiblePositions[0].position.accountId,
                  )
                }
                color='tertiary'
                text={t('fields.notifications.liquidation.single.button')}
              ></Button>
            </div>
          </>
        }
        hideCloseBtn
        showNotification
      />
    )
  }

  return (
    <Notification
      type={NotificationType.Warning}
      content={t('fields.notifications.liquidation.plural')}
      hideCloseBtn
      showNotification
    />
  )
}
