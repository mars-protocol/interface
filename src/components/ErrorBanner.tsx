import { memo, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styles from './ErrorBanner.module.scss'
import { CloseSVG } from './Svg'

interface ErrorBannerProps {
    hasNetworkError: boolean
    hasQueryError: boolean
    hasServerError: boolean
    isNetworkSupported: boolean | undefined
}

const ErrorBanner = memo(
    ({
        hasNetworkError,
        hasQueryError,
        hasServerError,
        isNetworkSupported,
    }: ErrorBannerProps) => {
        const { t } = useTranslation()
        const [hideError, setHideError] = useState(false)

        useEffect(() => {
            if (hasNetworkError || hasQueryError || hasServerError) {
                setHideError(false)
            }
        }, [hasNetworkError, hasQueryError, hasServerError])

        const getHeadline = (): string => {
            return hasNetworkError
                ? t('common.appearToBeOffline')
                : hasServerError
                ? t('error.serverOfflineTitle')
                : t('error.failingRequest')
        }

        const getBody = (): string => {
            return hasNetworkError
                ? t('error.youHaveAFailingNetworkRequest')
                : hasServerError
                ? t('error.serverOfflineBody')
                : t('error.failingRequestDescription')
        }

        return (
            <div>
                {/* Error banner is disabled for GQL errors currently */}
                {(hasNetworkError || hasServerError) && isNetworkSupported && (
                    <div
                        className={
                            !hideError
                                ? `${styles.network} ${styles.show}`
                                : styles.network
                        }
                    >
                        <div className={styles.container}>
                            <div className={styles.close}>
                                <button
                                    onClick={() => {
                                        setHideError(true)
                                    }}
                                >
                                    <CloseSVG />
                                </button>
                            </div>
                            <h3 className={styles.headline}>{getHeadline()}</h3>
                            <p>{getBody()}</p>
                            {!hasNetworkError && (
                                <p>
                                    <Trans i18nKey={'error.problemPersists'}>
                                        text
                                        <a
                                            className={styles.link}
                                            href='https://discord.gg/marsprotocol'
                                            target='_blank'
                                            rel='noreferrer'
                                        >
                                            link
                                        </a>
                                    </Trans>
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )
    }
)

export default ErrorBanner
