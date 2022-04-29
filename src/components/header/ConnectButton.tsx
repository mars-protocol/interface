import { ReactNode, useCallback, useState } from 'react'
import styles from './ConnectButton.module.scss'
import { WalletSVG } from '../Svg'
import { ClickAwayListener } from '@material-ui/core'
import { ConnectType, useWallet } from '@terra-money/wallet-provider'
import * as rdd from 'react-device-detect'
import { useTranslation } from 'react-i18next'

interface Props {
    textOverride?: string | ReactNode
    disabled?: boolean
    color?: string
    centered?: boolean
}

const ConnectButton = ({
    textOverride,
    disabled = false,
    color,
    centered = false,
}: Props) => {
    const { t } = useTranslation()
    const [openConnectList, setOpenConnectList] = useState(false)

    const { connect, availableConnections, availableInstallations } =
        useWallet()

    const onClickAway = useCallback(() => {
        setOpenConnectList(false)
    }, [])

    return (
        <div className={styles.wrapper}>
            <button
                className={
                    disabled
                        ? styles.disabledButton
                        : color
                        ? styles[color]
                        : styles.button
                }
                onClick={() => {
                    rdd.isMobile
                        ? connect(ConnectType.WALLETCONNECT)
                        : setOpenConnectList(!openConnectList)
                }}
            >
                <WalletSVG />
                <span className='overline'>
                    {textOverride || t('common.connectWallet')}
                </span>
            </button>
            {openConnectList && (
                <ClickAwayListener onClickAway={onClickAway}>
                    <div
                        className={
                            centered
                                ? `${styles.dropdown} ${styles.centered}`
                                : styles.dropdown
                        }
                    >
                        {!rdd.isMobile && (
                            <>
                                {availableConnections
                                    .filter(
                                        ({ type }) =>
                                            type !== ConnectType.READONLY
                                    )
                                    .map(({ type, name, identifier }) => {
                                        if (
                                            (type === ConnectType.EXTENSION &&
                                                identifier === 'station') ||
                                            type === ConnectType.WALLETCONNECT
                                        ) {
                                            return (
                                                <button
                                                    key={
                                                        'connection' +
                                                        type +
                                                        identifier
                                                    }
                                                    className={styles.option}
                                                    onClick={() => {
                                                        connect(
                                                            type,
                                                            identifier
                                                        )
                                                        setOpenConnectList(
                                                            false
                                                        )
                                                    }}
                                                >
                                                    {name}
                                                </button>
                                            )
                                        } else {
                                            return null
                                        }
                                    })}

                                {availableInstallations
                                    .filter(
                                        ({ type }) =>
                                            type === ConnectType.EXTENSION
                                    )
                                    .map(({ type, identifier, name, url }) => {
                                        if (
                                            type === ConnectType.EXTENSION &&
                                            identifier === 'station'
                                        ) {
                                            return (
                                                <a
                                                    key={
                                                        'installation' +
                                                        type +
                                                        identifier
                                                    }
                                                    className={styles.option}
                                                    href={url}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    onClick={() => {
                                                        setOpenConnectList(
                                                            false
                                                        )
                                                    }}
                                                >
                                                    {t('common.installName', {
                                                        name: name,
                                                    })}
                                                </a>
                                            )
                                        } else {
                                            return null
                                        }
                                    })}
                            </>
                        )}
                    </div>
                </ClickAwayListener>
            )}
        </div>
    )
}

export default ConnectButton
