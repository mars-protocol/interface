import BalanceCard from '../../components/BalanceCard'
import styles from './AlreadyVoted.module.scss'
import { useTranslation } from 'react-i18next'

export enum Vote {
    FOR,
    AGAINST,
    DID_NOT_VOTE,
}
interface Props {
    userXmarsVotingPower: number
    userVestedVotingPower: number
    vote: Vote
}

const AlreadyVoted = ({
    userXmarsVotingPower,
    userVestedVotingPower,
    vote,
}: Props) => {
    const { t } = useTranslation()
    return (
        <div className={styles.container}>
            <div className={styles.voteStatus}>
                <span className={`overline ${styles.title}`}>Voted</span>
                <div className={styles.votingStateWrapper}>
                    <span
                        className={`body ${styles.voted} ${
                            vote === Vote.FOR
                                ? styles.voteFor
                                : vote === Vote.AGAINST
                                ? styles.voteAgainst
                                : styles.didNotVote
                        }`}
                    >
                        {vote === Vote.FOR
                            ? t('council.votedFor')
                            : vote === Vote.AGAINST
                            ? t('council.votedAgainst')
                            : t('council.votedNot')}
                    </span>
                </div>
            </div>

            <div className={styles.votePowerContainer}>
                <BalanceCard
                    value={userXmarsVotingPower}
                    title={t('council.with')}
                />
            </div>
            {userVestedVotingPower > 0 && (
                <div className={styles.votePowerContainer}>
                    <BalanceCard
                        value={userVestedVotingPower}
                        title={t('common.and')}
                        suffix={` ${t('council.marsVesting')}`}
                    />
                </div>
            )}
        </div>
    )
}

export default AlreadyVoted
