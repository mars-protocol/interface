import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import Button from '../../../components/Button'
import Card from '../../../components/card/Card'
import {
    MARS_DECIMALS,
    MARS_DENOM,
    UST_DECIMALS,
    UST_DENOM,
} from '../../../constants/appConstants'
import {
    useAccountBalance,
    useContract,
    useNewContractMsg,
    useLockdropUserInfo,
    useLockdropLockupPositions,
    useAuctionUserInfo,
    useMarsLpAssetRate,
    useExchangeRate,
} from '../../../hooks'
import Header from '../../../layouts/txmodal/Header'
import {
    formatGasFee,
    formatTax,
    formatValue,
    lookupSymbol,
    lookup,
} from '../../../libs/parse'
import styles from './LockdropAction.module.scss'
import ust from '../../../images/UST.svg'
import mars from '../../../images/MARS-COLORED.svg'
import TxFailed from '../../../layouts/txmodal/TxFailed'
import TxResponse from '../../../layouts/txmodal/TxResponse'
import { TxResult, UserDenied } from '@terra-money/wallet-provider'
import { PostError } from '../../../layouts/txmodal/TxResultContent'
import { plus } from '../../../libs/math'
import { MsgExecuteContract, Fee, Coin } from '@terra-money/terra.js'
import TxFee from '../../../components/TxFee'
import useStore from '../../../store'

interface Props {
    phase: 'phase1' | 'phase2'
}

const LockdropAction = ({ phase }: Props) => {
    // @ts-ignore
    const { duration } = useParams()
    const { t } = useTranslation()
    const location = useLocation()
    const history = useHistory()
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const lockdropAddresses = useStore((s) => s.lockdropAddresses)
    const networkAddresses = useStore((s) => s.networkAddresses)
    const { refetch: refetchAccountBalance, convertMaTokenToUnderlying } =
        useAccountBalance()
    const userWalletAddress = useStore((s) => s.userWalletAddress)
    const getTax = useStore((s) => s.getTax)
    const { estimateFee, post } = useContract()
    const mountedRef = useRef(true)
    const newContractMsg = useNewContractMsg()
    const { refetch: refetchLockdropUserInfo } = useLockdropUserInfo()
    const { lockupPositions, refetch: refetchLockdropLockupPositions } =
        useLockdropLockupPositions()
    const { userInfo: auctionUserInfo, refetch: refetchAuctionUserInfo } =
        useAuctionUserInfo()
    const { marsLpToAssets } = useMarsLpAssetRate()
    const { exchangeToUusd } = useExchangeRate()

    const [selectedTarget, setSelectedTarget] = useState<'redbank' | 'wallet'>(
        'redbank'
    )
    const [feeError, setFeeError] = useState(false)
    const [response, setResponse] = useState<TxResult>()
    const [error, setError] = useState<PostError>()
    const [fee, setFee] = useState<StdFee>()
    const [feeLoading, setFeeLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [withdrawnValue, setWithdrawnValue] = useState(0)

    const isPhase1 = phase === 'phase1'
    const titleText = isPhase1
        ? t('mystation.withdrawUst')
        : t('mystation.withdrawMarsUstLpTokens')
    const handleClose = () => {
        history.push(`/${location.pathname.split('/')[1]}`)
    }
    const position = lockupPositions?.find(
        (position) => position.duration === Number(duration)
    )

    const underlyingAssets = isPhase1
        ? undefined
        : marsLpToAssets(Number(auctionUserInfo?.withdrawable_lp_shares))

    const amount = isPhase1
        ? convertMaTokenToUnderlying(
              UST_DENOM,
              Number(position?.maust_balance) || 0
          )
        : Number(auctionUserInfo?.withdrawable_lp_shares)
    const value = isPhase1
        ? 0
        : lookup(
              (underlyingAssets?.uusd || 0) +
                  exchangeToUusd(
                      new Coin(MARS_DENOM, underlyingAssets?.mars || 0)
                  ),
              UST_DENOM,
              UST_DECIMALS
          )
    const marsAmount = lookup(
        underlyingAssets?.mars || 0,
        MARS_DENOM,
        MARS_DECIMALS
    )
    const marsValue = lookup(
        exchangeToUusd(new Coin(MARS_DENOM, underlyingAssets?.mars || 0)),
        UST_DENOM,
        UST_DECIMALS
    )
    const ustAmount = lookup(
        underlyingAssets?.uusd || 0,
        UST_DENOM,
        UST_DECIMALS
    )
    const ustValue = lookup(
        underlyingAssets?.uusd || 0,
        UST_DENOM,
        UST_DECIMALS
    )
    // const apy = 1.14

    const handleAction = async () => {
        if (
            !lockdropAddresses?.lockdropAddress ||
            !lockdropAddresses.auctionAddress ||
            !networkAddresses?.contracts.redBankContractAddress
        ) {
            alert('Uh oh, operation failed')
            return
        }

        if (!fee) {
            return
        }

        setSubmitted(true)

        if (isPhase1) {
            setWithdrawnValue(
                convertMaTokenToUnderlying(
                    UST_DENOM,
                    Number(position?.maust_balance) || 0
                )
            )
        } else {
            setWithdrawnValue(
                (underlyingAssets?.uusd || 0) +
                    exchangeToUusd(
                        new Coin(MARS_DENOM, underlyingAssets?.mars || 0)
                    )
            )
        }

        const msgs = txMessage
        try {
            const { gasPrice, amount, gas } = fee

            const txOptions = {
                msgs,
                memo: '',
                gasPrices: `${gasPrice}uusd`,
                fee: new Fee(gas, {
                    uusd: plus(amount, tax),
                }),
                purgeQueue: true,
            }

            const postResponse = await post(txOptions)
            setResponse(postResponse)
        } catch (postError) {
            if (postError instanceof UserDenied) {
                setSubmitted(false)
                setResponse(undefined)
                setError(undefined)
            } else {
                setError(postError as PostError)
            }
        }
    }

    // reset scroll
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // -----------------------------
    // Transaction objects
    // -----------------------------

    // WithdrawUST
    const withdrawUstTxMessage = useMemo(() => {
        const msgs: MsgExecuteContract[] = []

        msgs.push(
            newContractMsg(lockdropAddresses?.lockdropAddress || '', {
                claim_rewards_and_unlock: {
                    lockup_to_unlock_duration: Number(duration),
                },
            })
        )

        if (selectedTarget === 'wallet') {
            const executeMsg: WithdrawTxMessage = {
                withdraw: {
                    asset: {
                        native: {
                            denom: UST_DENOM,
                        },
                    },
                    amount: amount.toFixed(0),
                },
            }
            msgs.push(
                newContractMsg(
                    networkAddresses?.contracts.redBankContractAddress || '',
                    executeMsg
                )
            )
        }

        return msgs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration, lockdropAddresses, selectedTarget])

    // Withdraw LP
    const withdrawLPTxMessage = useMemo(() => {
        return [
            newContractMsg(lockdropAddresses?.auctionAddress || '', {
                claim_rewards: { withdraw_unlocked_shares: true },
            }),
        ]
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lockdropAddresses])

    const txMessage = useMemo(() => {
        return isPhase1 ? withdrawUstTxMessage : withdrawLPTxMessage
    }, [withdrawUstTxMessage, withdrawLPTxMessage, isPhase1])

    const tax = getTax(amount.toString())

    const taxFormatted = useMemo(
        () => formatTax(whitelistedAssets, tax, UST_DENOM),
        [whitelistedAssets, tax]
    )
    const gasFeeFormatted = useMemo(
        () => formatGasFee(whitelistedAssets, fee?.amount.toString()),
        [fee, whitelistedAssets]
    )
    const txFee = useMemo(
        () => plus(gasFeeFormatted, taxFormatted),
        [gasFeeFormatted, taxFormatted]
    )

    useEffect(() => {
        let isSubscribed = true
        const fetchFee = async () => {
            if (
                !lockdropAddresses?.lockdropAddress ||
                !lockdropAddresses.auctionAddress ||
                !networkAddresses?.contracts.redBankContractAddress
            ) {
                return
            }

            setFeeLoading(true)
            const msgs = txMessage

            try {
                const fee = estimateFee({ msgs })
                setFee(await fee)
            } catch {
                if (isSubscribed) {
                    setFeeError(true)
                }
            } finally {
                setFeeLoading(false)
            }
        }

        fetchFee()

        return () => {
            isSubscribed = false
            mountedRef.current = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [txMessage, lockdropAddresses, networkAddresses])

    return (
        <section className={styles.container}>
            <div className={styles.cardContainer}>
                <Card>
                    {feeError ? (
                        <TxFailed
                            message={'Oops... something bad happened.'}
                            handleClose={handleClose}
                        />
                    ) : response || error ? (
                        <TxResponse
                            error={error}
                            response={response}
                            denom={UST_DENOM}
                            decimals={UST_DECIMALS}
                            amount={formatValue(
                                lookup(withdrawnValue, UST_DENOM, UST_DECIMALS),
                                2,
                                2,
                                true,
                                false,
                                false
                            )}
                            txFee={txFee}
                            handleClose={handleClose}
                            label={
                                isPhase1
                                    ? t('mystation.withdraw')
                                    : t('common.lpValue')
                            }
                            refetchQueries={[
                                refetchAccountBalance,
                                refetchLockdropUserInfo,
                                refetchLockdropLockupPositions,
                                refetchAuctionUserInfo,
                            ]}
                            title={
                                isPhase1
                                    ? selectedTarget === 'redbank'
                                        ? t('mystation.ustWithdrawToRedbank')
                                        : t('mystation.withdrawUst')
                                    : t('mystation.withdrawLP')
                            }
                        />
                    ) : (
                        <>
                            <Header
                                src={'close'}
                                handleClose={handleClose}
                                titleText={titleText}
                                tooltip={t(`${phase}Tooltip`)}
                            />
                            <div className={styles.body}>
                                {isPhase1 ? (
                                    <>
                                        <p className={styles.subline}>
                                            {t('common.amount')}
                                        </p>

                                        <div className={styles.amount}>
                                            <span className={styles.prefix}>
                                                {lookupSymbol(
                                                    UST_DENOM,
                                                    whitelistedAssets || []
                                                )}
                                            </span>{' '}
                                            {formatValue(
                                                lookup(
                                                    amount,
                                                    UST_DENOM,
                                                    UST_DECIMALS
                                                ),
                                                2,
                                                2,
                                                true,
                                                false,
                                                false
                                            )}
                                        </div>
                                        <p className={styles.subline}>
                                            {t('mystation.withdrawTo')}
                                        </p>
                                        <div className={styles.radioGroup}>
                                            <input
                                                type='radio'
                                                name='target'
                                                value='redbank'
                                                id='target-redbank'
                                                defaultChecked
                                            />
                                            <label
                                                htmlFor='target-redbank'
                                                onClick={() => {
                                                    setSelectedTarget('redbank')
                                                }}
                                            >
                                                <strong>
                                                    {t('global.redBank')}
                                                </strong>
                                                {/* <span className={styles.primary}>
                                                    {t('mystation.recommendedApy', {
                                                        apy: formatValue(
                                                            apy,
                                                            2,
                                                            2,
                                                            true,
                                                            'APY ',
                                                            '%'
                                                        ),
                                                    })}
                                                </span> */}
                                                <br />
                                                <span>
                                                    {t(
                                                        'mystation.withinTheRedBankYourUstCanBeUsed'
                                                    )}
                                                </span>
                                            </label>
                                        </div>
                                        <div className={styles.radioGroup}>
                                            <input
                                                type='radio'
                                                name='target'
                                                value='wallet'
                                                id='target-wallet'
                                            />
                                            <label
                                                htmlFor='target-wallet'
                                                onClick={() => {
                                                    setSelectedTarget('wallet')
                                                }}
                                            >
                                                <strong>
                                                    {t('common.wallet')}
                                                </strong>
                                                <br />
                                                <span>{userWalletAddress}</span>
                                            </label>
                                        </div>
                                        <div className={styles.buttonRow}>
                                            <Button
                                                disabled={
                                                    !fee ||
                                                    fee.amount === 0 ||
                                                    feeLoading ||
                                                    submitted
                                                }
                                                showProgressIndicator={
                                                    !fee ||
                                                    feeLoading ||
                                                    submitted
                                                }
                                                text={t('mystation.withdraw')}
                                                onClick={() => handleAction()}
                                                color='primary'
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.subline}>
                                            {t(
                                                'mystation.unlockedAndWithdrawableAmount'
                                            )}
                                        </div>
                                        <div className={styles.lpRow}>
                                            <div className={styles.lpIcons}>
                                                <img
                                                    src={mars}
                                                    alt='MARS logo'
                                                />
                                                <img src={ust} alt='UST logo' />
                                            </div>
                                            <span>
                                                {formatValue(
                                                    lookup(
                                                        amount,
                                                        UST_DENOM,
                                                        UST_DECIMALS
                                                    ),
                                                    2,
                                                    2,
                                                    true,
                                                    false,
                                                    ' MARS-UST LP Token'
                                                )}
                                            </span>
                                        </div>
                                        <div className={styles.valueRow}>
                                            {formatValue(
                                                value,
                                                2,
                                                2,
                                                true,
                                                '$',
                                                false
                                            )}
                                        </div>
                                        <div className={styles.infoBody}>
                                            <div className={styles.infoPart}>
                                                <div className={styles.amount}>
                                                    <span
                                                        className={
                                                            styles.prefix
                                                        }
                                                    >
                                                        MARS
                                                    </span>{' '}
                                                    {formatValue(
                                                        marsAmount,
                                                        2,
                                                        2,
                                                        true,
                                                        false,
                                                        false
                                                    )}
                                                </div>
                                                <div
                                                    className={styles.valueRow}
                                                >
                                                    {formatValue(
                                                        marsValue,
                                                        2,
                                                        2,
                                                        true,
                                                        '$',
                                                        false
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.infoPart}>
                                                <div className={styles.amount}>
                                                    <span
                                                        className={
                                                            styles.prefix
                                                        }
                                                    >
                                                        UST
                                                    </span>{' '}
                                                    {formatValue(
                                                        ustAmount,
                                                        2,
                                                        2,
                                                        true,
                                                        false,
                                                        false
                                                    )}
                                                </div>
                                                <div
                                                    className={styles.valueRow}
                                                >
                                                    {formatValue(
                                                        ustValue,
                                                        2,
                                                        2,
                                                        true,
                                                        '$',
                                                        false
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.buttonRow}>
                                            <Button
                                                disabled={
                                                    !fee ||
                                                    fee.amount === 0 ||
                                                    feeLoading ||
                                                    submitted
                                                }
                                                showProgressIndicator={
                                                    !fee ||
                                                    feeLoading ||
                                                    submitted
                                                }
                                                text={t('mystation.withdraw')}
                                                onClick={() => handleAction()}
                                                color='primary'
                                            />
                                        </div>
                                    </>
                                )}
                                <TxFee
                                    txFee={Number(gasFeeFormatted).toFixed(2)}
                                />
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </section>
    )
}

export default LockdropAction
