import { ReactNode, useEffect, useState } from 'react'
import Button from '../../components/Button'
import TxLink from './TxLink'
import { lookupSymbol, lookup, formatValue, dp } from '../../libs/parse'
import { TxResult } from '@terra-money/wallet-provider'
import { UserDenied, CreateTxFailed } from '@terra-money/wallet-provider'
import { TxFailed, TxUnspecifiedError } from '@terra-money/wallet-provider'
import styles from './TxResultContent.module.scss'
import DialogHeader from './DialogHeader'
import InfoTitle from './InfoTitle'
import { useTranslation } from 'react-i18next'
import useStore from '../../store'

export type PostError =
    | UserDenied
    | CreateTxFailed
    | TxFailed
    | TxUnspecifiedError

interface Props {
    response?: TxResult
    denom: string
    decimals: number
    amount: string
    supplyAmount?: number
    borrowAmount?: number
    assets?: WhitelistAsset[]
    txFee: string
    handleClose: () => void
    label: string
    refetchQueries: Array<() => void>
    title?: ReactNode
}

const TxResultContent = ({
    response,
    denom,
    decimals,
    amount,
    supplyAmount,
    borrowAmount,
    assets,
    txFee,
    handleClose,
    label,
    refetchQueries,
    title,
}: Props) => {
    const { t } = useTranslation()
    const finder = useStore((s) => s.getFinderUrl)
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const [refetched, setRefectched] = useState(false)

    const amountFormatted = !assets ? (
        <>
            <span className={styles.amountValue}>
                {formatValue(
                    amount,
                    2,
                    dp(decimals, denom),
                    true,
                    false,
                    ` ${lookupSymbol(denom, whitelistedAssets || [])}`
                )}
            </span>
        </>
    ) : (
        <>
            <span className={styles.amountValue}>
                {formatValue(
                    // @ts-ignore
                    lookup(
                        supplyAmount || 0,
                        assets[0].denom,
                        assets[0].decimals
                    ),
                    2,
                    2,
                    true,
                    false,
                    ` ${assets[0].symbol}`
                )}
            </span>
            <span className={styles.amountValue}>
                {formatValue(
                    // @ts-ignore
                    lookup(
                        borrowAmount || 0,
                        assets[1].denom,
                        assets[1].decimals
                    ),
                    2,
                    2,
                    true,
                    false,
                    ` ${assets[1].symbol}`
                )}
            </span>
        </>
    )

    useEffect(() => {
        if (!refetched) {
            refetchQueries.forEach((query: () => void) => {
                query()
            })
            setRefectched(true)
        }
    }, [refetched, refetchQueries])

    return (
        <div className={styles.container}>
            <DialogHeader
                handleClose={handleClose}
                titleText={t('common.completed')}
            />

            <div className={styles.result}>
                <div className={styles.infoContainer}>
                    <InfoTitle
                        title={t('common.transactionSuccessful')}
                        src={t('common.success')}
                        subTitle={t('common.summaryOfTheTransaction')}
                    />
                    <div className={styles.info}>
                        {title ? (
                            <div
                                className={styles.item}
                                style={{
                                    justifyContent: 'center',
                                }}
                            >
                                {title}
                            </div>
                        ) : null}

                        <div className={styles.item}>
                            <div className={styles.label}>{label}</div>
                            <div className={styles.value}>
                                <div className={styles.amount}>
                                    {amountFormatted}
                                </div>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <span className={`${styles.label}`}>
                                {t('common.transactionFee')}
                            </span>
                            <span>
                                {formatValue(
                                    txFee,
                                    2,
                                    2,
                                    false,
                                    false,
                                    ' UST',
                                    true
                                )}
                            </span>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.label}>
                                {t('common.txHash')}
                            </div>
                            <TxLink
                                hash={response?.result?.txhash || ''}
                                link={finder(
                                    response?.result?.txhash || '',
                                    'tx'
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ alignSelf: 'center', marginBottom: '32px' }}>
                <Button
                    disabled={false}
                    text={t('common.close')}
                    onClick={handleClose}
                    color='primary'
                />
            </div>
        </div>
    )
}

export default TxResultContent
