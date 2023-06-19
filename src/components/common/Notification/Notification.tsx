import classNames from 'classnames/bind'
import { SVG } from 'components/common'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { NotificationType, State } from 'types/enums'

import styles from './Notification.module.scss'

interface Props {
  showNotification: boolean
  content: ReactNode
  type: NotificationType
  hideCloseBtn?: boolean
}

export const Notification = ({ showNotification, content, type, hideCloseBtn = false }: Props) => {
  const { t } = useTranslation()
  const [closeNotification, setCloseNotification] = useState(false)
  const classes = classNames.bind(styles)
  const redBankState = useStore((s) => s.redBankState)

  const notificationClasses = classes({
    notification: true,
    closeBtnSpace: !hideCloseBtn,
    info: type === NotificationType.Info,
    warning: type === NotificationType.Warning,
  })

  if (!showNotification || closeNotification || redBankState !== State.READY) return null

  return (
    <div className={notificationClasses}>
      <span className={styles.icon}>
        {type === NotificationType.Warning ? <SVG.Warning /> : <SVG.Info />}
      </span>
      <div className={styles.content}>{content}</div>

      {!hideCloseBtn && (
        <button
          className={styles.closeNotification}
          onClick={() => {
            setCloseNotification(true)
          }}
          title={t('common.close')}
        >
          <SVG.SmallClose />
        </button>
      )}
    </div>
  )
}
