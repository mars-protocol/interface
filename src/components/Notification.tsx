import { ReactNode, useMemo, useState } from 'react'

import styles from './Notification.module.scss'
import { SmallCloseSVG } from './Svg'
import { useTranslation } from 'react-i18next'
import { NotificationType } from '../types/enums'

interface Props {
    showNotification: boolean
    content: ReactNode
    type: NotificationType
    hideCloseBtn?: boolean
}

const Notification = ({
    showNotification,
    content,
    type,
    hideCloseBtn = false,
}: Props) => {
    const { t } = useTranslation()
    const [closeNotification, setCloseNotification] = useState(false)

    const typeClass = useMemo(() => {
        return type === NotificationType.Warning
            ? styles.warning
            : type === NotificationType.Error
            ? styles.error
            : styles.info
    }, [type])

    return (
        <>
            {showNotification && !closeNotification ? (
                <div
                    className={`${styles.notification} ${typeClass} ${
                        !hideCloseBtn ? styles.closeBtnSpace : null
                    }`}
                >
                    <p>{content}</p>

                    {!hideCloseBtn && (
                        <button
                            title={t('common.close')}
                            className={styles.closeNotification}
                            onClick={() => {
                                setCloseNotification(true)
                            }}
                        >
                            <SmallCloseSVG />
                        </button>
                    )}
                </div>
            ) : null}
        </>
    )
}

export default Notification
