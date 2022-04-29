import Header from '../../../layouts/txmodal/Header'
import styles from './Stake.module.scss'
import { useEffect, useMemo, useRef, useState } from 'react'
import ModalTab from './modaltab/ModalTab'
import TxResponse from '../../../layouts/txmodal/TxResponse'
import TxFailed from '../../../layouts/txmodal/TxFailed'
import { formatGasFee, lookup } from '../../../libs/parse'
import { MsgExecuteContract, Fee } from '@terra-money/terra.js'
import Card from '../../../components/card/Card'
import StakingProgress from './modaltab/StakingProgress'
import {
    useMarsBalance,
    useAddressProvider,
    useNewContractMsg,
    useContract,
    useStaking,
} from '../../../hooks'
import {
    COOLDOWN_BUFFER,
    MARS_DECIMALS,
    MARS_DENOM,
} from '../../../constants/appConstants'
import { useCooldown } from '../hooks/useCooldown'
import { TxResult, UserDenied } from '@terra-money/wallet-provider'
import { PostError } from '../../../layouts/txmodal/TxResultContent'
import { plus } from '../../../libs/math'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { useHistory, useLocation } from 'react-router-dom'
import { ViewType } from '../../../types/enums'
import Disclaimer from './modaltab/Disclaimer'
import useStore from '../../../store'

export interface ModalActionButton {
    text: String
    disabled: boolean
    clickHandler: () => void
    color: string
}

const Stake = () => {
    const { t } = useTranslation()
    const location = useLocation()
    const newContractMsg = useNewContractMsg()
    const { claim, refetch: refetchCooldown } = useCooldown()
    const { refetch: refetchStaking } = useStaking()
    const { config } = useAddressProvider()
    const { estimateFee, post } = useContract()
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const basecampAddresses = useStore((s) => s.basecampAddresses)
    const { refetch: refetchMarsBalance } = useMarsBalance()
    const history = useHistory()

    const [refreshTx, setRefreshTx] = useState(true)
    const [amount, setAmount] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [response, setResponse] = useState<TxResult>()
    const [error, setError] = useState<PostError>()
    const [fee, setFee] = useState<StdFee>()
    const [dontShowAgain, setDontShowAgain] = useState(true)
    const [haveShownDisclaimer, setHaveShownDisclaimer] = useState(false)
    const [feeError, setFeeError] = useState(false)
    const [claimInProgress, setClaimInProgress] = useState(false)

    const activeView =
        location.pathname === '/council/stake'
            ? ViewType.Stake
            : ViewType.Unstake

    // Read only states
    const STAKE_DISCLAIMER = 'stakedisclaimer'
    const UNSTAKE_DISCLAIMER = 'unstakedisclaimer'

    const tax = '0' // we don't need tax on this modal as we don't use native assets
    const basecampContractAddress = basecampAddresses?.contracts.basecampAddress
    const marsTokenAddress = config?.mars_token_address || ''
    const marsXTokenAddress = config?.xmars_token_address || ''
    const stakingContractAddress = config?.staking_address || ''

    const time = new Date().getTime()
    const gasFeeFormatted = useMemo(
        () => formatGasFee(whitelistedAssets, fee?.amount.toString()),
        [fee, whitelistedAssets]
    )

    const txFee = useMemo(() => gasFeeFormatted, [gasFeeFormatted])
    const cooldownEnd = claim
        ? Number(claim.cooldown_end_timestamp) * 1000 + COOLDOWN_BUFFER
        : -1

    // for readibility

    const claimReady = claim && cooldownEnd < time

    // ------------------
    //callbacks
    // ------------------

    const refetchCooldownSafely = () => {
        if (!claimInProgress) {
            refetchCooldown()
        }
    }

    // -----------------------------
    // Transaction objects
    // -----------------------------
    const stakeMessage = () => {
        const executeMsg = {
            send: {
                amount: amount === 0 ? '100' : amount.toFixed(0),
                contract: stakingContractAddress,
                msg: Buffer.from(JSON.stringify({ stake: {} })).toString(
                    'base64'
                ),
            },
        }

        const msgs: MsgExecuteContract[] = [
            newContractMsg(marsTokenAddress, executeMsg),
        ]

        return msgs
    }

    const unStakeMessage = () => {
        const executeMsg = {
            send: {
                contract: stakingContractAddress,
                amount: amount === 0 ? '100' : amount.toFixed(0),
                msg: Buffer.from(JSON.stringify({ unstake: {} })).toString(
                    'base64'
                ),
            },
        }

        const msgs: MsgExecuteContract[] = [
            newContractMsg(marsXTokenAddress, executeMsg),
        ]

        return msgs
    }

    const claimMessage = () => {
        const executeMsg = {
            claim: {},
        }

        const msgs: MsgExecuteContract[] = [
            newContractMsg(stakingContractAddress, executeMsg),
        ]

        return msgs
    }

    const txMessage =
        activeView === ViewType.Stake
            ? stakeMessage()
            : !claim
            ? unStakeMessage()
            : claimReady
            ? claimMessage()
            : null

    const mountedRef = useRef(true)

    useEffect(() => {
        setRefreshTx(true)
    }, [activeView])

    useEffect(() => {
        if (claimInProgress) {
            setRefreshTx(true)
        }
    }, [claimInProgress])

    useEffect(() => {
        setClaimInProgress(claim !== null && claim !== undefined)
        // eslint-disable-next-line
    }, [claim])

    useEffect(() => {
        let isSubscribed = true
        const fetchFee = async () => {
            const msgs = txMessage
            if (refreshTx && msgs) {
                setRefreshTx(false)
                if (
                    !basecampContractAddress ||
                    !marsXTokenAddress ||
                    !marsTokenAddress
                ) {
                    return
                }
                try {
                    const fee = await estimateFee({ msgs })
                    setFee(fee)
                } catch {
                    if (isSubscribed) {
                        setFeeError(true)
                    }
                }
            }
        }

        fetchFee()

        return () => {
            isSubscribed = false
            mountedRef.current = false
        }
    }, [
        activeView,
        estimateFee,
        txMessage,
        refreshTx,
        marsTokenAddress,
        marsXTokenAddress,
        basecampContractAddress,
    ])

    const handleAction = async () => {
        if (
            !marsXTokenAddress ||
            !marsTokenAddress ||
            !basecampContractAddress
        ) {
            alert(t('error.errorStake'))
            return
        }

        setSubmitted(true)

        if (!fee || !txMessage) {
            return
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

    const startStakingCallback = async () => {
        handleAction()
    }

    const reset = () => {
        setAmount(0)
        setFeeError(false)
        setSubmitted(false)
        setResponse(undefined)
        setError(undefined)
    }

    const handleClose = () => {
        reset()
        history.push('/council')
        if (claimInProgress) refetchCooldown()
    }

    const waitingForCooldown = claim !== null && moment(cooldownEnd).isAfter()

    const produceActionButtonSpec = (
        callback: () => void
    ): ModalActionButton => {
        return {
            disabled:
                !Number(amount) ||
                (activeView === ViewType.Unstake && waitingForCooldown),
            text: activeView,
            clickHandler: callback,
            color: 'primary',
        }
    }

    // ========================
    // PRESENTATION
    // ========================
    const storage = window.localStorage

    const hideDisclaimer = () => {
        if (dontShowAgain) {
            if (activeView === ViewType.Stake)
                storage.setItem(STAKE_DISCLAIMER, 'true')
            else storage.setItem(UNSTAKE_DISCLAIMER, 'true')
        }

        setHaveShownDisclaimer(true)
    }

    const getAmount = (): string => {
        if (activeView === ViewType.Unstake) {
            if (claim) {
                return lookup(
                    Number(claim.amount),
                    MARS_DENOM,
                    MARS_DECIMALS
                ).toString()
            } else {
                return ''
            }
        } else {
            return lookup(amount, MARS_DENOM, MARS_DECIMALS).toString()
        }
    }

    const disclaimerRequired = () => {
        const key =
            activeView === ViewType.Stake
                ? STAKE_DISCLAIMER
                : UNSTAKE_DISCLAIMER
        const hasDismissedPreviously = storage.getItem(key)
        const firstTimeStaking = !hasDismissedPreviously && !haveShownDisclaimer
        return firstTimeStaking
    }

    return (
        <div className={styles.cardContainer}>
            <Card>
                <div className={styles.container}>
                    {feeError && !waitingForCooldown ? (
                        <TxFailed
                            message={t('error.errorEstimatedFee')}
                            handleClose={handleClose}
                        />
                    ) : response || error ? (
                        <TxResponse
                            error={error}
                            response={response}
                            denom={MARS_DENOM}
                            decimals={MARS_DECIMALS}
                            amount={getAmount()}
                            txFee={txFee}
                            handleClose={handleClose}
                            label={
                                activeView === ViewType.Unstake
                                    ? claimInProgress
                                        ? t('council.unstaked')
                                        : t('council.cooldownStatedFor')
                                    : t('council.staked')
                            }
                            refetchQueries={[
                                refetchCooldownSafely,
                                refetchMarsBalance,
                                refetchStaking,
                            ]}
                        />
                    ) : disclaimerRequired() ? (
                        <Disclaimer
                            handleClose={handleClose}
                            hideDisclaimer={hideDisclaimer}
                            setDontShowAgain={setDontShowAgain}
                            dontShowAgain={dontShowAgain}
                            activeView={activeView}
                        />
                    ) : (
                        <div>
                            <Header
                                src={'back'}
                                handleClose={handleClose}
                                titleText={activeView}
                                tooltip={
                                    activeView === ViewType.Unstake
                                        ? claimInProgress
                                            ? cooldownEnd
                                                ? t(
                                                      'council.cooldownEndedTooltip'
                                                  )
                                                : t('council.cooldownTooltip')
                                            : t('council.unstakingMarsTooltip')
                                        : t('council.stakingMarsTooltip')
                                }
                            />
                            {claimInProgress &&
                            activeView === ViewType.Unstake ? (
                                <StakingProgress
                                    clickHandler={startStakingCallback}
                                    submitted={submitted}
                                    gasFeeFormatted={gasFeeFormatted}
                                    showButton={true}
                                    cooldown={claim}
                                    cooldownEnd={cooldownEnd}
                                />
                            ) : (
                                <ModalTab
                                    amount={Number(amount)}
                                    setAmountCallback={setAmount}
                                    stakedAmount={0} // todo required?
                                    actionButtonSpec={produceActionButtonSpec(
                                        handleAction
                                    )}
                                    submitted={submitted}
                                    gasFeeFormatted={gasFeeFormatted}
                                    activeView={activeView}
                                    denom={MARS_DENOM}
                                    decimals={MARS_DECIMALS}
                                    showWarning={false}
                                />
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default Stake
