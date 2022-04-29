import { CircularProgress } from '@material-ui/core'
import { ReactNode, useState } from 'react'
import ActiveProposalCard from '../components/ActiveProposalCard'
import { Proposal, useProposals } from '../hooks/useProposals'
import styles from './ActiveProposals.module.scss'

interface Props {
    quorum: number
}

const ActiveProposals = ({ quorum }: Props) => {
    const { getActiveProposals } = useProposals()
    const [cardsToDisplay, setCardsToDisplay] = useState<ReactNode[]>([])
    const activeProposals: Proposal[] = getActiveProposals()

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
            <ActiveProposalCard
                key={proposal.proposal_id}
                proposalId={Number(proposal.proposal_id)}
                active={true}
                votesFor={forPercentage}
                votesAgainst={againstPercentage}
                quorum={quorum}
                title={proposal.title}
                description={proposal.description}
                endDate={proposal.endDate}
            />
        )
    }

    if (cardsToDisplay.length === 0 && activeProposals.length > 0) {
        const results = activeProposals.map((proposal: Proposal) => {
            return buildCard(
                proposal,
                Number(proposal.totalXmarsVotingPower) +
                    Number(proposal.totalVestedVotingPower)
            )
        })

        setCardsToDisplay(results)
    }

    return (
        <div className={styles.activeProposals}>
            {cardsToDisplay.length > 0 ? (
                cardsToDisplay.map((card) => card)
            ) : (
                <CircularProgress />
            )}
        </div>
    )
}

export default ActiveProposals
