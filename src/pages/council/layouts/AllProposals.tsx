import Card from '../../../components/card/Card'
import ProposalCard from '../components/ProposalCard'
import Tooltip from '../../../components/tooltip/Tooltip'
import styles from './AllProposals.module.scss'
import { Proposal, useProposals } from '../hooks/useProposals'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FORUM_URL } from '../../../constants/appConstants'
import Button from '../../../components/Button'
import { ExternalSVG } from '../../../components/Svg'
interface Props {
    actionButtonHandler: () => void
    quorum: number
}

const AllProposals = ({ actionButtonHandler, quorum }: Props) => {
    const { t } = useTranslation()
    const { getInactiveProposals } = useProposals()
    const [cardsToDisplay, setCardsToDisplay] = useState<ReactNode[]>([])
    const inactiveProposals: Proposal[] = getInactiveProposals()

    // -------------------------
    // STATE
    // -------------------------

    const buildCard = (proposal: Proposal, totalSupply: number): ReactNode => {
        const forVotes = Number(proposal.for_votes)
        const againstVotes = Number(proposal.against_votes)

        const forPercentage =
            totalSupply === 0 || forVotes === 0
                ? 0
                : (forVotes / totalSupply) * 100
        const againstPercentage =
            totalSupply === 0 || againstVotes === 0
                ? 0
                : (againstVotes / totalSupply) * 100

        return (
            <ProposalCard
                key={proposal.proposal_id}
                proposalId={Number(proposal.proposal_id)}
                votesFor={forPercentage}
                votesAgainst={againstPercentage}
                quorum={quorum}
                title={proposal.title}
                description={proposal.description}
                endDate={proposal.endDate}
            />
        )
    }

    if (cardsToDisplay.length === 0 && inactiveProposals.length > 0) {
        const results = inactiveProposals.map((proposal: Proposal) => {
            return buildCard(
                proposal,
                Number(proposal.totalXmarsVotingPower) +
                    Number(proposal.totalVestedVotingPower)
            )
        })

        setCardsToDisplay(results)
    }

    // -------------------------
    // CLICK HANDLERS
    // -------------------------
    const goToDiscord = () => {
        window.open(FORUM_URL, '_blank')
    }

    // -------------------------
    // PRESENTATION
    // -------------------------
    return (
        <Card>
            <div className={styles.allProposals}>
                <div className={styles.newProposal}>
                    <div className={styles.tooltip}>
                        <Tooltip
                            content={t('council.allProposalsTooltip')}
                            iconWidth={'18px'}
                        />
                    </div>
                    <Button
                        text={t('council.newProposal')}
                        onClick={actionButtonHandler}
                        color='secondary'
                        styleOverride={{ marginRight: '8px' }}
                    />
                    <Button
                        text={t('council.goToForum')}
                        onClick={goToDiscord}
                        color={'tertiary'}
                        styleOverride={{ marginLeft: '8px' }}
                        suffix={<ExternalSVG />}
                    />
                </div>
                {cardsToDisplay.map((card) => card)}
            </div>
        </Card>
    )
}

export default AllProposals
