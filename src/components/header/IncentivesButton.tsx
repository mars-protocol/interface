import {
    useContract,
    useAddressProvider,
    useNewContractMsg,
    useIncentives,
    useInterval,
    useAirdrop,
    useLockdropUserInfo,
    useAuctionUserInfo,
    useStaking,
    useExchangeRate,
} from '../../hooks'
import styles from './IncentivesButton.module.scss'
import { lookup, formatValue, formatGasFee } from '../../libs/parse'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { LogoSVG } from '../Svg'
import { ClickAwayListener } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import Button from '../Button'
import Tooltip from '../tooltip/Tooltip'
import {
    MsgExecuteContract,
    Fee,
    TxInfo,
    LCDClient,
    Coin,
} from '@terra-money/terra.js'
import { STATUS } from '../../layouts/txmodal/TxResponse'
import {
    AIRDROP_CLAIM_FEATURE,
    ASTRO_DECIMALS,
    ASTRO_DENOM,
    MARS_DECIMALS,
    MARS_DENOM,
    UST_DECIMALS,
    UST_DENOM,
    XMARS_DECIMALS,
    XMARS_DENOM,
} from '../../constants/appConstants'
import { TxResult } from '@terra-money/wallet-provider'
import TxFee from '../../components/TxFee'
import { PostError } from '../../layouts/txmodal/TxResultContent'
import colors from '../../styles/_assets.module.scss'
import TxLink from '../../layouts/txmodal/TxLink'
import useStore from '../../store'

const IncentivesButton = () => {
    const { t } = useTranslation()
    const { config } = useAddressProvider()
    const newContractMsg = useNewContractMsg()
    const { estimateFee, post } = useContract()
    const { balance: incentivesBalance, refetch: refetchIncentives } =
        useIncentives()
    const lcd = useStore((s) => s.networkConfig?.lcd)
    const chainID = useStore((s) => s.networkConfig?.chainID)
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const lockdropAddresses = useStore((s) => s.lockdropAddresses)
    const getFinderUrl = useStore((s) => s.getFinderUrl)

    const { xMarsRatio } = useStaking()
    const { exchangeToUusd } = useExchangeRate()
    const {
        userInfo: airdropUserInfo,
        airdropData,
        getAirdropBalance,
        refetch: refetchAirdrop,
    } = useAirdrop()
    const {
        userInfo: lockdropUserInfo,
        getLockdropBalance,
        refetch: refetchLockDropUserInfo,
    } = useLockdropUserInfo()
    const { userInfo: auctionUserInfo, refetch: refetchAuctionUserInfo } =
        useAuctionUserInfo()
    const isRewardCenterOpen = useStore((s) => s.isRewardCenterOpen)
    const setIsRewardCenterOpen = useStore((s) => s.setIsRewardCenterOpen)
    const [response, setResponse] = useState<TxResult>()
    const [txInfo, setTxInfo] = useState<TxInfo>()
    const [error, setError] = useState<PostError>()
    const [fee, setFee] = useState<StdFee>()
    const [showDetails, setShowDetails] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [checkTxStatus, setCheckTxStatus] = useState(false)
    const [feeLoading, setFeeLoading] = useState(false)

    const phase1MarsBalance = getLockdropBalance()
    const phase1XmarsBalance =
        Number(lockdropUserInfo?.pending_xmars_to_claim) || 0

    const phase2MarsLockedBalance =
        (Number(auctionUserInfo?.total_auction_incentives) || 0) -
        (Number(auctionUserInfo?.withdrawn_auction_incentives) || 0) -
        (Number(auctionUserInfo?.withdrawable_auction_incentives) || 0)
    const phase2MarsUnlockedBalance =
        Number(auctionUserInfo?.withdrawable_auction_incentives) || 0
    const phase2MarsLpBalance =
        Number(auctionUserInfo?.withdrawable_mars_incentives) || 0
    const phase2AstroLpBalance =
        Number(auctionUserInfo?.withdrawable_astro_incentives) || 0
    const airdropBalance = getAirdropBalance()

    const calculateDollarInputAmount = (
        amount: number,
        denom: string = MARS_DENOM
    ) =>
        lookup(exchangeToUusd(new Coin(denom, amount)), UST_DENOM, UST_DECIMALS)

    const incentivesBalanceAsUusd = calculateDollarInputAmount(
        incentivesBalance || 0
    )
    const incentivesBalanceAsXmars =
        xMarsRatio > 0 ? (incentivesBalance || 0) / xMarsRatio : 0

    const lockDropData = {
        phase1: {
            unlocked: lookup(phase1MarsBalance, MARS_DENOM, MARS_DECIMALS),
            unlockedUusd: calculateDollarInputAmount(phase1MarsBalance),
            xmarsLp: lookup(phase1XmarsBalance, XMARS_DENOM, XMARS_DECIMALS),
            xmarsLpUusd: calculateDollarInputAmount(
                phase1XmarsBalance * xMarsRatio
            ),
        },
        phase2: {
            locked: lookup(phase2MarsLockedBalance, MARS_DENOM, MARS_DECIMALS),
            lockedUusd: calculateDollarInputAmount(phase2MarsLockedBalance),
            unlocked: lookup(
                phase2MarsUnlockedBalance,
                MARS_DENOM,
                MARS_DECIMALS
            ),
            unlockedUusd: calculateDollarInputAmount(phase2MarsUnlockedBalance),
            marsLp: lookup(phase2MarsLpBalance, MARS_DENOM, MARS_DECIMALS),
            marsLpUusd: calculateDollarInputAmount(phase2MarsLpBalance),
            astroLp: lookup(phase2AstroLpBalance, MARS_DENOM, ASTRO_DECIMALS),
            astroLpUusd: calculateDollarInputAmount(
                phase2AstroLpBalance,
                ASTRO_DENOM
            ),
        },
        airdrop: {
            balance: lookup(airdropBalance, MARS_DENOM, MARS_DECIMALS),
            balanceUusd: calculateDollarInputAmount(airdropBalance),
        },
    }

    const totalRewardsAsUusd =
        incentivesBalanceAsUusd +
        lockDropData.phase1.unlockedUusd +
        lockDropData.phase1.xmarsLpUusd +
        lockDropData.phase2.unlockedUusd +
        lockDropData.phase2.marsLpUusd +
        lockDropData.phase2.astroLpUusd +
        lockDropData.airdrop.balanceUusd

    const redBankIncentives =
        lookup(incentivesBalance || 0, MARS_DENOM, MARS_DECIMALS) >= 0.01
            ? 1
            : 0
    const phase1 =
        lockDropData.phase1.unlocked >= 0.01 ||
        lockDropData.phase1.xmarsLp >= 0.01
            ? 1
            : 0
    const phase2 =
        lockDropData.phase2.unlocked >= 0.01 ||
        lockDropData.phase2.marsLp >= 0.01 ||
        lockDropData.phase2.astroLp >= 0.01
            ? 1
            : 0
    const phase2ReadOnly =
        lockDropData.phase2.locked >= 0.01 &&
        lockDropData.phase2.unlocked < 0.01 &&
        lockDropData.phase2.marsLp < 0.01 &&
        lockDropData.phase2.astroLp < 0.01
            ? 1
            : 0
    const airdrop = lockDropData.airdrop.balance >= 0.01 ? 1 : 0
    const noClaimsAvailable = redBankIncentives + phase1 + phase2 + airdrop
    const showTotal = noClaimsAvailable > 1
    const showLockdrop = phase1 + (phase2 || phase2ReadOnly) + airdrop > 0

    const onClose = useCallback(() => {
        setShowDetails(false)
        setResponse(undefined)
        setTxInfo(undefined)
    }, [])

    const onClickAway = useCallback(() => {
        onClose()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const disabled =
        submitted ||
        (!redBankIncentives && !phase1 && !phase2 && !airdrop) ||
        !fee?.amount

    const gasFeeFormatted = useMemo(
        () => formatGasFee(whitelistedAssets, fee?.amount.toString()),
        [fee, whitelistedAssets]
    )

    const txStatus =
        !response?.success || error || txInfo?.code
            ? STATUS.FAILURE
            : !txInfo
            ? STATUS.LOADING
            : STATUS.SUCCESS

    const txMessages = useMemo((): MsgExecuteContract[] => {
        const msgs: MsgExecuteContract[] = []

        if (redBankIncentives && config?.incentives_address) {
            msgs.push(
                newContractMsg(config.incentives_address, {
                    claim_rewards: {},
                })
            )
        }

        if (phase1 && lockdropAddresses?.lockdropAddress) {
            msgs.push(
                newContractMsg(lockdropAddresses.lockdropAddress, {
                    claim_rewards_and_unlock: {},
                })
            )
        }

        if (phase2 && lockdropAddresses?.auctionAddress) {
            msgs.push(
                newContractMsg(lockdropAddresses.auctionAddress, {
                    claim_rewards: { withdraw_unlocked_shares: false },
                })
            )
        }

        if (
            AIRDROP_CLAIM_FEATURE &&
            airdrop &&
            lockdropAddresses?.airdropAddress
        ) {
            // If the user hasn't claimed airdrop, then do so
            if (!Number(airdropUserInfo?.airdrop_amount)) {
                const airdropClaimMsg: AirdropClaimMessage = {
                    claim: {
                        claim_amount: airdropData?.amount || '0',
                        merkle_proof: airdropData?.merkle_proof || [],
                        root_index: airdropData?.index || 0,
                    },
                }
                msgs.push(
                    newContractMsg(
                        lockdropAddresses.airdropAddress,
                        airdropClaimMsg
                    )
                )
            }
            // Else the user claimed airdrop during phase 2 but did not delegate 100% of it
            // so withdraw the remaining amount to user wallet
            else {
                msgs.push(
                    newContractMsg(lockdropAddresses.airdropAddress, {
                        withdraw_airdrop_reward: {},
                    })
                )
            }
        }

        return msgs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        redBankIncentives,
        config?.incentives_address,
        phase1,
        lockdropAddresses?.lockdropAddress,
        phase2,
        lockdropAddresses?.auctionAddress,
        airdrop,
        lockdropAddresses?.airdropAddress,
    ])

    useEffect(() => {
        if (isRewardCenterOpen) {
            setShowDetails(true)
            setIsRewardCenterOpen(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRewardCenterOpen])

    useEffect(() => {
        const fetchFee = async () => {
            if (!txMessages.length) return
            setFeeLoading(true)
            const fee = await estimateFee({ msgs: txMessages })
            setFee(fee)
            setFeeLoading(false)
        }
        fetchFee()
        // eslint-disable-next-line
    }, [txMessages])

    useInterval(
        () => {
            setCheckTxStatus(true)
        },
        txStatus === STATUS.LOADING ? 1000 : null
    )

    useEffect(() => {
        const getTxInfo = async (hash: string) => {
            if (!response?.result?.txhash || !lcd || !chainID) return

            const terra = new LCDClient({
                URL: lcd,
                chainID: chainID,
            })

            try {
                const txInfoResponse = await terra.tx.txInfo(hash)
                refetchIncentives()
                refetchLockDropUserInfo()
                refetchAuctionUserInfo()
                refetchAirdrop()
                setTxInfo(txInfoResponse)
                setSubmitted(false)
            } catch {
            } finally {
                // We get 404's until the transaction is complete.
                setCheckTxStatus(false)
            }
        }
        getTxInfo(response?.result?.txhash || '')
        // eslint-disable-next-line
    }, [response?.result?.txhash, lcd, chainID, checkTxStatus])

    const claimRewards = async () => {
        if (!config || !fee?.amount) {
            alert(t('error.errorClaim'))
            return
        }

        setSubmitted(true)

        try {
            const { gasPrice, amount, gas } = fee

            const txOptions = {
                msgs: txMessages,
                memo: '',
                gasPrices: `${gasPrice}uusd`,
                fee: new Fee(gas, {
                    uusd: amount,
                }),
                purgeQueue: true,
            }

            const postResponse = await post(txOptions)
            setResponse(postResponse)
            setTxInfo(undefined)
        } catch (postError) {
            setError(postError as PostError)
            setSubmitted(false)
        }
    }

    return (
        <div className={styles.wrapper}>
            <button
                className={
                    noClaimsAvailable > 0
                        ? `${styles.button} ${styles.buttonHighlight}`
                        : styles.button
                }
                onClick={() => {
                    if (txStatus === STATUS.SUCCESS) {
                        setResponse(undefined)
                        setTxInfo(undefined)
                    }

                    setShowDetails(!showDetails)
                }}
            >
                <LogoSVG />
                <div className={styles.balance}>
                    {formatValue(totalRewardsAsUusd, 2, 2, true, '$')}
                </div>
            </button>

            {showDetails && (
                <ClickAwayListener onClickAway={onClickAway}>
                    <div className={styles.details}>
                        <div className={styles.detailsHeader}>
                            <p className={styles.detailsHead}>
                                {t('incentives.marsRewardsCenter')}
                            </p>
                            <div className={styles.tooltip}>
                                <Tooltip
                                    content={t(
                                        'incentives.marsRewardsCenterTooltip'
                                    )}
                                    iconWidth={'20px'}
                                />
                            </div>
                        </div>
                        {txStatus === STATUS.SUCCESS ? (
                            <div className={styles.detailsBody}>
                                <div className={styles.successContainer}>
                                    <span
                                        className={`h6 ${styles.successTitle}`}
                                    >
                                        {t('common.transactionSuccessful')}
                                    </span>
                                    <div className={styles.succcessTxHash}>
                                        <div className={styles.label}>
                                            {t('common.txHash')}
                                        </div>
                                        <div className={styles.value}>
                                            <TxLink
                                                hash={
                                                    response?.result?.txhash ||
                                                    ''
                                                }
                                                link={getFinderUrl(
                                                    response?.result?.txhash ||
                                                        '',
                                                    'tx'
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        text={t('common.close')}
                                        onClick={() => onClose()}
                                        color='primary'
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={styles.detailsBody}>
                                {incentivesBalanceAsXmars > 0 && (
                                    <div className={styles.container}>
                                        <div className={styles.position}>
                                            <div className={styles.label}>
                                                <p className={styles.token}>
                                                    xMARS
                                                </p>
                                                <p className={styles.subhead}>
                                                    {t(
                                                        'redbank.redBankRewards'
                                                    )}
                                                </p>
                                            </div>
                                            <div className={styles.value}>
                                                <p
                                                    className={
                                                        styles.tokenAmount
                                                    }
                                                >
                                                    {formatValue(
                                                        lookup(
                                                            incentivesBalanceAsXmars ||
                                                                0,
                                                            MARS_DENOM,
                                                            MARS_DECIMALS
                                                        )
                                                    )}
                                                </p>
                                                <p
                                                    className={
                                                        styles.tokenValue
                                                    }
                                                >
                                                    {formatValue(
                                                        incentivesBalanceAsUusd,
                                                        2,
                                                        2,
                                                        true,
                                                        '$'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showLockdrop && (
                                    <div className={styles.container}>
                                        <div className={styles.position}>
                                            <div className={styles.label} />
                                            <div className={styles.value}>
                                                <p className={styles.headline}>
                                                    {t('incentives.locked')}
                                                </p>
                                            </div>
                                            <div className={styles.value}>
                                                <p className={styles.headline}>
                                                    {t('incentives.unlocked')}
                                                </p>
                                            </div>
                                        </div>
                                        {!!phase1 && (
                                            <>
                                                <div
                                                    className={styles.position}
                                                >
                                                    <p className={styles.head}>
                                                        {t('incentives.phase1')}
                                                    </p>
                                                </div>
                                                {lockDropData.phase1.unlocked >=
                                                    0.01 && (
                                                    <div
                                                        className={
                                                            styles.position
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.label
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    styles.token
                                                                }
                                                            >
                                                                MARS
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.subhead
                                                                }
                                                            >
                                                                {t(
                                                                    'incentives.depositRewards'
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.value
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    styles.tokenAmount
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase1
                                                                        .unlocked
                                                                )}
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.tokenValue
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase1
                                                                        .unlockedUusd,
                                                                    2,
                                                                    2,
                                                                    true,
                                                                    '$'
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {lockDropData.phase1.xmarsLp >=
                                                    0.01 && (
                                                    <div
                                                        className={
                                                            styles.position
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.label
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    styles.token
                                                                }
                                                            >
                                                                xMARS
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.subhead
                                                                }
                                                            >
                                                                {t(
                                                                    'incentives.ongoingRewards'
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.value
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    styles.tokenAmount
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase1
                                                                        .xmarsLp
                                                                )}
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.tokenValue
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase1
                                                                        .xmarsLpUusd,
                                                                    2,
                                                                    2,
                                                                    true,
                                                                    '$'
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {(!!phase2 || !!phase2ReadOnly) && (
                                            <>
                                                <div
                                                    className={styles.position}
                                                >
                                                    <p className={styles.head}>
                                                        {t('incentives.phase2')}
                                                    </p>
                                                </div>
                                                {(lockDropData.phase2.locked >=
                                                    0.01 ||
                                                    lockDropData.phase2
                                                        .unlocked >= 0.01) && (
                                                    <div
                                                        className={
                                                            styles.position
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.label
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    styles.token
                                                                }
                                                            >
                                                                MARS
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.subhead
                                                                }
                                                            >
                                                                {t(
                                                                    'incentives.depositRewards'
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.value
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    styles.tokenAmount
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase2
                                                                        .locked
                                                                )}
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.tokenValue
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase2
                                                                        .lockedUusd,
                                                                    2,
                                                                    2,
                                                                    true,
                                                                    '$'
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.value
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    styles.tokenAmount
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase2
                                                                        .unlocked
                                                                )}
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.tokenValue
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase2
                                                                        .unlockedUusd,
                                                                    2,
                                                                    2,
                                                                    true,
                                                                    '$'
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {lockDropData.phase2.marsLp >=
                                                    0.01 && (
                                                    <div
                                                        className={
                                                            styles.position
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.label
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    styles.token
                                                                }
                                                            >
                                                                MARS LP
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.subhead
                                                                }
                                                            >
                                                                {t(
                                                                    'incentives.lpRewards'
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.value
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    styles.tokenAmount
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase2
                                                                        .marsLp
                                                                )}
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.tokenValue
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase2
                                                                        .marsLpUusd,
                                                                    2,
                                                                    2,
                                                                    true,
                                                                    '$'
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {lockDropData.phase2.astroLp >=
                                                    0.01 && (
                                                    <div
                                                        className={
                                                            styles.position
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.label
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    styles.token
                                                                }
                                                            >
                                                                ASTRO LP
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.subhead
                                                                }
                                                            >
                                                                {t(
                                                                    'incentives.lpRewards'
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div
                                                            className={
                                                                styles.value
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    styles.tokenAmount
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase2
                                                                        .astroLp
                                                                )}
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.tokenValue
                                                                }
                                                            >
                                                                {formatValue(
                                                                    lockDropData
                                                                        .phase2
                                                                        .astroLpUusd,
                                                                    2,
                                                                    2,
                                                                    true,
                                                                    '$'
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {!!airdrop && (
                                            <div className={styles.position}>
                                                <div className={styles.label}>
                                                    <p className={styles.token}>
                                                        MARS
                                                    </p>
                                                    <p
                                                        className={
                                                            styles.subhead
                                                        }
                                                    >
                                                        {t(
                                                            'incentives.airdrop'
                                                        )}
                                                    </p>
                                                </div>
                                                <div className={styles.value}>
                                                    <p
                                                        className={
                                                            styles.tokenAmount
                                                        }
                                                    >
                                                        {formatValue(
                                                            lockDropData.airdrop
                                                                .balance
                                                        )}
                                                    </p>
                                                    <p
                                                        className={
                                                            styles.tokenValue
                                                        }
                                                    >
                                                        {formatValue(
                                                            lockDropData.airdrop
                                                                .balanceUusd,
                                                            2,
                                                            2,
                                                            true,
                                                            '$'
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {showTotal && (
                                    <div className={styles.total}>
                                        <div className={styles.position}>
                                            <div className={styles.label}>
                                                <p className={styles.subhead}>
                                                    {t(
                                                        'incentives.totalRewards'
                                                    )}
                                                </p>
                                            </div>
                                            {/* Only phase 2 rewards can be locked so no need to add up rest of values here */}
                                            <div className={styles.value}>
                                                <p
                                                    className={
                                                        styles.tokenAmount
                                                    }
                                                >
                                                    {formatValue(
                                                        lockDropData.phase2
                                                            .lockedUusd,
                                                        2,
                                                        2,
                                                        true,
                                                        '$'
                                                    )}
                                                </p>
                                            </div>
                                            <div className={styles.value}>
                                                <p
                                                    className={
                                                        styles.tokenAmount
                                                    }
                                                >
                                                    <strong>
                                                        {formatValue(
                                                            totalRewardsAsUusd,
                                                            2,
                                                            2,
                                                            true,
                                                            '$'
                                                        )}
                                                    </strong>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className={styles.claimButton}>
                                    <Button
                                        disabled={disabled || feeLoading}
                                        showProgressIndicator={
                                            submitted || feeLoading
                                        }
                                        text={
                                            !disabled &&
                                            !submitted &&
                                            !feeLoading
                                                ? showLockdrop
                                                    ? t(
                                                          'incentives.claimUnlockedRewards'
                                                      )
                                                    : t(
                                                          'incentives.claimRewards'
                                                      )
                                                : t('incentives.nothingToClaim')
                                        }
                                        onClick={() =>
                                            submitted ? null : claimRewards()
                                        }
                                        color='primary'
                                    />
                                </div>
                                <div style={{ marginTop: '11px' }}>
                                    <TxFee
                                        txFee={Number(gasFeeFormatted).toFixed(
                                            2
                                        )}
                                        styleOverride={{
                                            color: colors.secondaryDark,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </ClickAwayListener>
            )}
        </div>
    )
}

export default IncentivesButton
