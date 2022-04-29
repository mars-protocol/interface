import styles from './VoteCount.module.scss'
import { useTranslation } from 'react-i18next'
import { formatValue, lookup } from '../../../libs/parse'
import { XMARS_DECIMALS, XMARS_DENOM } from '../../../constants/appConstants'

export enum VoteState {
    For,
    Against,
}

interface Props {
    width: number
    votes: number
    voteState: VoteState
    voteCount: number
}

const VoteCount = ({ width, votes, voteState, voteCount }: Props) => {
    const { t } = useTranslation()
    const checkedVotes = votes <= 0 || votes === Infinity ? 0 : votes
    const boundValue = (value: number) =>
        value <= 0 ? 0 : value >= 100 ? 100 : value
    const votePercentage =
        checkedVotes > 0 ? (checkedVotes / voteCount) * 100 : 0
    const votesForBounded = boundValue(votePercentage)

    return (
        <div className={styles.voted} style={{ width: width }}>
            <div className={styles.votedBarGlow}>
                <div
                    className={
                        voteState === VoteState.For
                            ? styles.votesFor
                            : styles.votesAgainst
                    }
                    style={{ width: `${votesForBounded}%` }}
                >
                    {' '}
                </div>
            </div>

            <div className={styles.votedBar}>
                <div
                    className={
                        voteState === VoteState.For
                            ? styles.votesFor
                            : styles.votesAgainst
                    }
                    style={{ width: `${votesForBounded}%` }}
                />
            </div>

            <div className={`overline ${styles.votedInfo}`}>
                <div className={styles.votedPercent}>
                    <span className={styles.title}>
                        {voteState === VoteState.For
                            ? `${t('council.for')}:`
                            : `${t('council.against')}:`}
                    </span>
                    <span
                        className={
                            voteState === VoteState.For
                                ? styles.for
                                : styles.against
                        }
                    >
                        {votePercentage === Infinity
                            ? '0.00'
                            : votePercentage.toFixed(2)}
                        %
                    </span>
                </div>
                <div className={styles.votedBreakdown}>
                    <span className={styles.title}>
                        {formatValue(
                            lookup(
                                checkedVotes === 0 ? 0 : checkedVotes,
                                XMARS_DENOM,
                                XMARS_DECIMALS
                            ),
                            0,
                            6,
                            false,
                            false,
                            ` ${t('council.votes')}`
                        )}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default VoteCount
