import CurrentVote from './layouts/CurrentVote'
import ActiveProposal from './layouts/ActiveProposal'

import styles from './Proposal.module.scss'
import VoteCard from './layouts/VoteCard'
import { Proposal as ProposalModel, useProposals } from '../hooks/useProposals'
import { useParams } from 'react-router'
import { ReactNode, useEffect, useState } from 'react'
import Notification from '../../../components/Notification'
import moment from 'moment'
import { useBasecamp } from '../../../hooks/useBasecamp'
import { Trans } from 'react-i18next'
import { Redirect } from 'react-router-dom'
import { NotificationType } from '../../../types/enums'
import { DocURL } from '../../../types/enums/DocURL.enum'

const Proposal = () => {
    const { findProposal, refetch } = useProposals()
    const { config: basecampConfig } = useBasecamp()
    const [showNotification, setShowNotification] = useState(false)
    const [notificationContent, setNotificationContent] = useState<ReactNode>()
    const [currentProposal, setCurrentProposal] = useState<ProposalModel>()
    const [refreshPropsal, setRefreshProposal] = useState<boolean>(false)

    const totalSnapshotVotingPower =
        Number(currentProposal?.totalXmarsVotingPower) +
            Number(currentProposal?.totalVestedVotingPower) || 0

    // @ts-ignore
    const { id } = useParams()

    const showUserNotification = (notificationContent: ReactNode) => {
        setShowNotification(true)
        setNotificationContent(notificationContent)
    }

    useEffect(() => {
        if (!currentProposal) return

        const votingPower =
            Number(currentProposal.userVestedVotingPower) +
            Number(currentProposal.userXmarsVotingPower)
        if (votingPower === 0 && moment(currentProposal?.endDate).isAfter()) {
            showUserNotification(
                <Trans i18nKey='council.notificationWarning'>
                    text
                    <a
                        href={DocURL.STAKING_XMARS}
                        target='_blank'
                        rel='noreferrer'
                        className={styles.learnMore}
                    >
                        Learn More
                    </a>
                </Trans>
            )
        }
    }, [currentProposal])

    useEffect(() => {
        const proposal = findProposal(Number(id || 0))
        setCurrentProposal(proposal)
    }, [id, findProposal])

    useEffect(() => {
        if (refreshPropsal) {
            refetch()
            setRefreshProposal(false)
        }
    }, [refreshPropsal, refetch])

    // reset scroll
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // -----------------
    // PRESENTATION
    // -----------------

    const proposalExists = findProposal(Number(id))

    return (
        <div>
            {/* Redirect to council in case of 404 */}
            {!proposalExists ? <Redirect to='/council' /> : null}

            <div className={styles.container}>
                <Notification
                    showNotification={showNotification}
                    type={NotificationType.Info}
                    content={notificationContent}
                />
                <div className={styles.content}>
                    <div className={styles.body}>
                        <ActiveProposal proposal={currentProposal} />
                        <CurrentVote
                            votesFor={Number(currentProposal?.for_votes)}
                            votesAgainst={Number(
                                currentProposal?.against_votes
                            )}
                            quorum={
                                Number(
                                    basecampConfig?.proposal_required_quorum
                                ) * 100
                            }
                            totalVotingPower={totalSnapshotVotingPower}
                        />
                    </div>

                    <div className={styles.vote}>
                        <VoteCard
                            userXmarsVotingPower={Number(
                                currentProposal?.userXmarsVotingPower || 0
                            )}
                            userVestedVotingPower={Number(
                                currentProposal?.userVestedVotingPower || 0
                            )}
                            proposal={currentProposal}
                            setNotification={showUserNotification}
                            refreshProposal={setRefreshProposal}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Proposal
