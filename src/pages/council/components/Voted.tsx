import styles from './Voted.module.scss'
import { useTranslation } from 'react-i18next'

interface Props {
    width: number
    votesFor: number
    votesAgainst: number
    quorum: number
}

const Voted = ({ width, votesFor, votesAgainst, quorum }: Props) => {
    const { t } = useTranslation()
    const checkedVotesFor =
        isNaN(votesFor) || votesFor === Infinity ? 0 : votesFor
    const checkedVotesAgainst =
        isNaN(votesAgainst) || votesAgainst === Infinity ? 0 : votesAgainst
    const boundValue = (value: number) =>
        value <= 0 ? 0 : value >= 100 ? 100 : value
    const votesForBounded = boundValue(checkedVotesFor)
    const votesAgainstBounded = boundValue(checkedVotesAgainst)
    const quorumBounded = boundValue(quorum)

    return (
        <div className={styles.voted} style={{ width: width }}>
            <div
                className={styles.quorumTitle}
                style={{ marginLeft: `${quorumBounded}%` }}
            >
                <div className={styles.quorumDotContainer}>
                    <div className={styles.quorumGlow} />
                    <div className={styles.quorumDot} />
                </div>
                <div
                    className={`overline ${styles.quorumText}`}
                    style={{ marginLeft: quorumBounded > 70 ? -110 : 0 }}
                >
                    {t('council.quorum')}: {quorum.toFixed()}%
                </div>
            </div>

            <div className={styles.votedBarGlow}>
                <div
                    className={styles.votesFor}
                    style={{ width: `${votesForBounded}%` }}
                />
                <div
                    className={styles.votesAgainst}
                    style={{ width: `${votesAgainstBounded}%` }}
                />
            </div>

            <div className={styles.votedBar}>
                <div
                    className={styles.votesFor}
                    style={{ width: `${votesForBounded}%` }}
                />
                <div
                    className={styles.votesAgainst}
                    style={{ width: `${votesAgainstBounded}%` }}
                />
            </div>

            <div
                className={styles.quorumBar}
                style={{ left: `${quorumBounded}%` }}
            />

            <div className={`overline ${styles.votedInfo}`}>
                <div className={styles.votedPercent}>
                    <span className={styles.title}>{t('council.voted')}:</span>
                    <span>
                        {(checkedVotesFor + checkedVotesAgainst).toFixed(2)}%
                    </span>
                </div>
                <div className={styles.votedBreakdown}>
                    <div className={styles.votesFor}>
                        <span className={styles.title}>For:</span>
                        <span className={styles.value}>
                            {checkedVotesFor.toFixed(2)}%
                        </span>
                    </div>
                    <div className={styles.votesAgainst}>
                        <span className={styles.title}>Against:</span>
                        <span className={styles.value}>
                            {checkedVotesAgainst.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Voted
