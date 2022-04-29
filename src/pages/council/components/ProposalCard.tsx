import moment from 'moment'
import { Link } from 'react-router-dom'
import EndDate from '../proposal/components/EndDate'
import MultilineContent from '../proposal/components/MultilineContent'
import styles from './ProposalCard.module.scss'
import Voted from './Voted'
import { useTranslation } from 'react-i18next'

interface Props {
    votesFor: number
    votesAgainst: number
    quorum: number
    title: string
    description: string
    endDate: string
    proposalId: number
}

const ProposalCard = ({
    votesFor,
    votesAgainst,
    quorum,
    title,
    description,
    endDate,
    proposalId,
}: Props) => {
    const { t } = useTranslation()
    const endDateFormatted = moment(endDate).format('MMM Do, hh:mm:ss')
    const fromNow = moment(endDate).fromNow()
    const checkedVotesFor =
        isNaN(votesFor) || votesFor === Infinity ? 0 : votesFor
    const checkedVotesAgainst =
        isNaN(votesAgainst) || votesAgainst === Infinity ? 0 : votesAgainst

    return (
        <div className={styles.container}>
            <Link
                className={styles.link}
                to={`/council/proposal/${proposalId}`}
            >
                <div className={styles.content}>
                    <div className={styles.infoSection}>
                        <div className={styles.title}>
                            <h4>{title}</h4>
                        </div>
                        <div className={`body2 ${styles.desc}`}>
                            <MultilineContent content={description} />
                        </div>
                    </div>
                    <div className={styles.statsSection}>
                        <div className={styles.info}>
                            <div className={styles.voteEnds}>
                                <div className={`caption ${styles.header}`}>
                                    {t('council.voteEnds')}:
                                </div>
                                <div className={`body2 ${styles.text}`}>
                                    <EndDate
                                        endDateFormatted={endDateFormatted}
                                        fromNow={fromNow}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.votes}>
                            <Voted
                                width={341}
                                votesFor={checkedVotesFor}
                                votesAgainst={checkedVotesAgainst}
                                quorum={quorum}
                            />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default ProposalCard
