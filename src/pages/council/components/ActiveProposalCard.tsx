import Card from '../../../components/card/Card'
import styles from './ActiveProposalCard.module.scss'
import ProposalCard from './ProposalCard'

interface Props {
    active?: boolean
    votesFor: number
    votesAgainst: number
    quorum: number
    title: string
    description: string
    endDate: string
    proposalId: number
}

const ActiveProposalCard = ({
    active,
    votesFor,
    votesAgainst,
    quorum,
    title,
    description,
    endDate,
    proposalId,
}: Props) => {
    return (
        <div className={styles.proposalCard}>
            {active ? <div className={styles.active} /> : null}
            <Card>
                <ProposalCard
                    proposalId={proposalId}
                    votesFor={votesFor}
                    votesAgainst={votesAgainst}
                    quorum={quorum}
                    title={title}
                    description={description}
                    endDate={endDate}
                />
            </Card>
        </div>
    )
}

export default ActiveProposalCard
