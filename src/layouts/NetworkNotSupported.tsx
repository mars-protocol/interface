import { useTranslation } from 'react-i18next'
import Button from '../components/Button'
import useStore from '../store'
import styles from './NetworkNotSupported.module.scss'

const NetworkNotSupported = () => {
    const { t } = useTranslation()
    const name = useStore((s) => s.networkConfig?.name)
    const isNetworkSupported = useStore((s) => s.isNetworkSupported)

    return (
        <div className={styles.splash}>
            <div className={styles.initializing}>
                {!isNetworkSupported && (
                    <>
                        <h2 className={styles.head}>
                            {t('error.marsContractsCouldNotBeFound')}
                        </h2>
                        <p className={styles.subhead}>
                            {t('error.selectADifferentNetwork')}
                        </p>
                        <p className={styles.current}>
                            <span>{t('common.currentNetwork')}:</span> {name}
                        </p>
                        <Button
                            size='medium'
                            text={t('common.refresh')}
                            onClick={() => {
                                window.location.reload()
                            }}
                            color='secondary'
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export default NetworkNotSupported
