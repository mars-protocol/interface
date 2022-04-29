import { useAccountBalance, useTNS } from '../../hooks'
import { truncate } from '../../libs/text'
import styles from './ConnectedButton.module.scss'
import { formatValue, lookup } from '../../libs/parse'
import { useCallback, useState } from 'react'
import Button from '../Button'
import useClipboard from 'react-use-clipboard'
import { CheckSVG, CopySVG, ExternalSVG, WalletSVG } from '../Svg'
import colors from '../../styles/_assets.module.scss'
import { CircularProgress, ClickAwayListener } from '@material-ui/core'
import { useWallet } from '@terra-money/wallet-provider'
import { useTranslation } from 'react-i18next'
import {
    FINDER_URL,
    UST_DECIMALS,
    UST_DENOM,
} from '../../constants/appConstants'
import { State } from '../../types/enums'
import useStore from '../../store'

interface Props {
    address: string
}

const ConnectedButton = ({ address }: Props) => {
    const { find, state } = useAccountBalance()
    const chainID = useStore((s) => s.networkConfig?.chainID)
    const name = useStore((s) => s.networkConfig?.name)
    const { disconnect } = useWallet()
    const uusdAmount = Number(find(UST_DENOM)?.amount || 0)
    const [showDetails, setShowDetails] = useState(false)

    const [isCopied, setCopied] = useClipboard(address, {
        successDuration: 1000 * 5,
    })

    const viewOnFinder = useCallback(() => {
        window.open(`${FINDER_URL}/${chainID}/account/${address}`, '_blank')
    }, [chainID, address])

    const onClickAway = useCallback(() => {
        setShowDetails(false)
    }, [])
    const { t } = useTranslation()

    const walletAddress = useTNS(address, true)
    const tnsAddress = useTNS(address, false)

    return (
        <div className={styles.wrapper}>
            {name !== 'mainnet' && (
                <span className={styles.network}>{name}</span>
            )}
            <button
                className={styles.button}
                onClick={() => {
                    setShowDetails(!showDetails)
                }}
            >
                <span className={styles.walletIcon}>
                    <WalletSVG className={styles.walletIcon} />
                </span>
                <span className={styles.address}>
                    {walletAddress ? walletAddress : truncate(address, [2, 4])}
                </span>
                <div className={styles.balance}>
                    {state === State.READY ? (
                        `${formatValue(
                            lookup(uusdAmount, UST_DENOM, UST_DECIMALS)
                        )}`
                    ) : (
                        <CircularProgress
                            color='inherit'
                            size={'0.9rem'}
                            className={styles.circularProgress}
                        />
                    )}{' '}
                    UST
                </div>
            </button>
            {showDetails && (
                <ClickAwayListener onClickAway={onClickAway}>
                    <div className={styles.details}>
                        <div className={styles.detailsHeader}>
                            <div className={styles.detailsBalance}>
                                <WalletSVG color={colors.secondaryDark} />
                                <p>
                                    {formatValue(
                                        lookup(
                                            uusdAmount,
                                            UST_DENOM,
                                            UST_DECIMALS
                                        ),
                                        0
                                    )}{' '}
                                    UST
                                </p>
                            </div>
                            <div className={styles.detailsButton}>
                                <Button
                                    text={t('common.disconnect')}
                                    color='secondary'
                                    onClick={disconnect}
                                />
                            </div>
                        </div>
                        <div className={styles.detailsBody}>
                            <p className={`sub2 ${styles.addressLabel}`}>
                                {tnsAddress
                                    ? tnsAddress
                                    : t('common.yourAddress')}
                            </p>
                            <p className={styles.address}>{address}</p>
                            <p className={styles.addressMobile}>
                                {truncate(address, [14, 14])}
                            </p>
                            <div className={styles.buttons}>
                                <button
                                    className={styles.copy}
                                    onClick={setCopied}
                                >
                                    <CopySVG color={colors.secondaryDark} />
                                    {isCopied ? (
                                        <>
                                            {t('common.copied')}{' '}
                                            <CheckSVG
                                                color={colors.secondaryDark}
                                            />
                                        </>
                                    ) : (
                                        <>{t('common.copy')}</>
                                    )}
                                </button>
                                <button
                                    className={styles.external}
                                    onClick={viewOnFinder}
                                >
                                    <ExternalSVG color={colors.secondaryDark} />{' '}
                                    {t('common.viewOnFinder')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ClickAwayListener>
            )}
        </div>
    )
}

export default ConnectedButton
