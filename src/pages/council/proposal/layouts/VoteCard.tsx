import moment from 'moment'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import Card from '../../../../components/card/Card'
import { useInterval, useNewContractMsg } from '../../../../hooks'
import Header from '../../../../layouts/txmodal/Header'
import { Proposal, ProposalVote, useProposals } from '../../hooks/useProposals'
import styles from './VoteCard.module.scss'
import VoteSection from './votes/VoteSection'

import { formatGasFee } from '../../../../libs/parse'
import {
    LCDClient,
    MsgExecuteContract,
    Fee,
    TxInfo,
} from '@terra-money/terra.js'
import { STATUS } from '../../../../layouts/txmodal/TxResponse'
import useErrorMessage from '../../../../hooks/useErrorMessage'
import { useAddressProvider } from '../../../../hooks/useAddressProvider'
import { TxResult, UserDenied } from '@terra-money/wallet-provider'
import { PostError } from '../../../../layouts/txmodal/TxResultContent'
import { useContract } from '../../../../hooks/useContract'
import { useTranslation } from 'react-i18next'
import useStore from '../../../../store'
import { CircularProgress } from '@material-ui/core'
import AlreadyVoted, { Vote } from './votes/AlreadyVoted'

interface Props {
    userXmarsVotingPower: number
    userVestedVotingPower: number
    proposal: Proposal | undefined
    setNotification: (content: ReactNode) => void
    refreshProposal: (refresh: boolean) => void
}

const VoteCard = ({
    userXmarsVotingPower,
    userVestedVotingPower,
    proposal,
    setNotification,
    refreshProposal,
}: Props) => {
    const { t } = useTranslation()
    //---------------
    // STATES
    //---------------
    const { findProposalVote } = useProposals()
    const userWalletAddress = useStore((s) => s.userWalletAddress)
    const [voteResult, setVoteResult] = useState<ProposalVote>()
    const [voteResultInitialised, setVoteResultIntiialised] =
        useState<Boolean>(false)
    const lcd = useStore((s) => s.networkConfig?.lcd)
    const chainID = useStore((s) => s.networkConfig?.chainID)
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const basecampAddresses = useStore((s) => s.basecampAddresses)
    const newContractMsg = useNewContractMsg()
    const { config } = useAddressProvider()
    const { estimateFee, post } = useContract()
    const [refreshTx, setRefreshTx] = useState(true)
    const [submittedYes, setSubmittedYes] = useState(false)
    const [submittedNo, setSubmittedNo] = useState(false)
    const [response, setResponse] = useState<TxResult>()
    const [error, setError] = useState<PostError>()
    const [fee, setFee] = useState<StdFee>()
    const [checkTxStatus, setCheckTxStatus] = useState(false)
    const [txInfo, setTxInfo] = useState<TxInfo>()
    const [refetchRequired, setRefetchRequired] = useState(true)

    const votingOpen = moment(proposal?.endDate).isAfter()
    const formError = '#c83333'

    // Read only states
    const basecampContractAddress = basecampAddresses?.contracts.basecampAddress
    const marsTokenAddress = config?.mars_token_address || ''
    const marsXTokenAddress = config?.xmars_token_address || ''
    const proposalId = Number(proposal?.proposal_id)
    const xMarsBalance = userXmarsVotingPower + userVestedVotingPower
    const canVote = xMarsBalance > 0

    // ------------------
    // logic
    // ------------------

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
    const faliureMessage = useErrorMessage(
        txInfo?.raw_log ||
            response?.result?.raw_log ||
            error?.message ||
            (error instanceof UserDenied && 'Denied by the user') ||
            ''
    )
    // -----------------------------
    // Vote Tx
    // -----------------------------
    const voteMessage = useCallback(
        (voteOption: 'for' | 'against') => {
            const executeMsg = {
                cast_vote: { proposal_id: proposalId, vote: voteOption },
            }

            const msgs: MsgExecuteContract[] = [
                newContractMsg(basecampContractAddress || '0', executeMsg),
            ]

            return msgs
        },
        [basecampContractAddress, proposalId, newContractMsg]
    )

    useEffect(() => {
        setRefreshTx(true)
    }, [proposalId])

    useEffect(() => {
        const fetchFee = async () => {
            if (refreshTx) {
                if (
                    !basecampContractAddress ||
                    !marsXTokenAddress ||
                    !marsTokenAddress ||
                    !proposal ||
                    // If the voting period has ended, don't try to estimate vote cost - SC error
                    !votingOpen ||
                    // If we have tried to load votes, and there is one already, don't try to estimate vote cost - SC error
                    !voteResultInitialised ||
                    (voteResultInitialised && !!voteResult) ||
                    !canVote
                ) {
                    return
                }

                const msgs = voteMessage('against')
                const fee = await estimateFee({ msgs })
                setFee(fee)

                setRefreshTx(false)
            }
        }
        fetchFee()
        // eslint-disable-next-line
    }, [
        voteResult,
        voteResultInitialised,
        votingOpen,
        refreshTx,
        marsTokenAddress,
        marsXTokenAddress,
        basecampContractAddress,
        proposal,
        xMarsBalance,
    ])

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
                setTxInfo(txInfoResponse)
                refetchVoteStatus()
            } catch {
            } finally {
                // We get 404's until the transaction is complete.
                setCheckTxStatus(false)
            }
        }
        getTxInfo(response?.result?.txhash || '')
    }, [response?.result?.txhash, lcd, chainID, checkTxStatus])

    //---------------
    // CALLBACKS
    //---------------
    const handleAction = async (voteOption: 'for' | 'against') => {
        if (
            !marsXTokenAddress ||
            !marsTokenAddress ||
            !basecampContractAddress
        ) {
            alert(t('error.errorVote'))
            return
        }

        if (!fee) {
            return
        }
        const msgs = voteMessage(voteOption)
        try {
            const { gasPrice, amount, gas } = fee

            const txOptions = {
                msgs,
                memo: '',
                gasPrices: `${gasPrice}uusd`,
                fee: new Fee(gas, {
                    uusd: amount,
                }),
                purgeQueue: true,
            }

            const postResponse = await post(txOptions)
            setResponse(postResponse)
        } catch (postError) {
            setError(postError as PostError)
        }
    }

    const handleNoVote = () => {
        setSubmittedNo(true)
        handleAction('against')
    }

    const handleYesVote = () => {
        handleAction('for')
        setSubmittedYes(true)
    }

    useEffect(
        () => {
            if (!txInfo) return
            refreshProposal(true)

            if (txInfo?.code) {
                const content = (
                    <span
                        className={`body`}
                        style={{
                            display: 'flex',
                            flex: 'auto',
                            color: formError,
                        }}
                    >
                        {t('council.voteFailedMessage', {
                            message: faliureMessage,
                        })}
                    </span>
                )
                setNotification(content)
            }
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [txStatus, response]
    )

    useEffect(() => {
        const fetchVoteStatus = async (proposalId: number) => {
            if (voteResultInitialised && !refetchRequired) return

            const result = await findProposalVote(proposalId)
            if (result) setVoteResult(result)

            setVoteResultIntiialised(true)
            setRefetchRequired(false)
        }

        if (proposal?.proposal_id) fetchVoteStatus(proposal?.proposal_id)
    }, [
        findProposalVote,
        voteResultInitialised,
        proposal,
        userWalletAddress,
        refetchRequired,
    ])

    const refetchVoteStatus = () => setRefetchRequired(true)

    return (
        <Card>
            <div className={styles.container}>
                <Header
                    titleText={t('council.myVote')}
                    tooltip={t('council.activeProposalMyVoteTooltip')}
                />
                <div className={styles.bodyContainer}>
                    {!voteResultInitialised ? (
                        <div className={styles.circularProgressContainer}>
                            <CircularProgress color='inherit' size={'0.9rem'} />
                        </div>
                    ) : !votingOpen || voteResult ? (
                        <AlreadyVoted
                            userXmarsVotingPower={Number(userXmarsVotingPower)}
                            userVestedVotingPower={Number(
                                userVestedVotingPower
                            )}
                            vote={
                                voteResult
                                    ? voteResult.option === 'for'
                                        ? Vote.FOR
                                        : Vote.AGAINST
                                    : Vote.DID_NOT_VOTE
                            }
                        />
                    ) : (
                        <VoteSection
                            userXmarsVotingPower={Number(userXmarsVotingPower)}
                            userVestedVotingPower={Number(
                                userVestedVotingPower
                            )}
                            submittedYes={
                                submittedYes && txStatus === STATUS.LOADING
                            }
                            submittedNo={
                                submittedNo && txStatus === STATUS.LOADING
                            }
                            voteForClickHandler={handleYesVote}
                            voteAgainstClickHandler={handleNoVote}
                            isOpen={votingOpen}
                            gasFeeFormatted={gasFeeFormatted}
                            canVote={canVote}
                        />
                    )}
                </div>
            </div>
        </Card>
    )
}

export default VoteCard
