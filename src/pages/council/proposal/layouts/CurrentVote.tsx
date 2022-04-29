import { Collapse } from '@material-ui/core'
import { useState } from 'react'
import Card from '../../../../components/card/Card'
import VoteCount, { VoteState } from '../../components/VoteCount'
import Voted from '../../components/Voted'
import styles from './CurrentVote.module.scss'
import { useTranslation } from 'react-i18next'
import Tooltip from '../../../../components/tooltip/Tooltip'
import Button from '../../../../components/Button'

interface Props {
    votesFor: number
    votesAgainst: number
    quorum: number
    totalVotingPower: number
}

const CurrentVote = ({
    votesFor,
    votesAgainst,
    quorum,
    totalVotingPower,
}: Props) => {
    const { t } = useTranslation()
    const checkedVotesFor =
        isNaN(votesFor) || votesFor === Infinity ? 0 : votesFor
    const checkedVotesAgainst =
        isNaN(votesAgainst) || votesAgainst === Infinity ? 0 : votesAgainst
    const votesForPercentage =
        checkedVotesFor === 0 ? 0 : (checkedVotesFor / totalVotingPower) * 100
    const votesAgainstPercentage =
        checkedVotesAgainst === 0
            ? 0
            : (checkedVotesAgainst / totalVotingPower) * 100

    // -------------
    // STATES
    // -------------
    const [showVoteDetails, setShowVoteDetails] = useState<boolean>()

    const onExpandClickHandler = () => {
        setShowVoteDetails(!showVoteDetails)
    }

    return (
        <Card styleOverride={{ marginTop: '32px' }}>
            <div className={styles.container}>
                <div className={styles.tooltip}>
                    <Tooltip
                        content={t('council.activeProposalCurrentVoteTooltip')}
                        iconWidth={'18px'}
                    />
                </div>
                <span className={`caption ${styles.title}`}>
                    {t('council.currentVote')}
                </span>
                <div className={styles.votedWrapper}>
                    <Voted
                        width={720}
                        votesFor={votesForPercentage}
                        votesAgainst={votesAgainstPercentage}
                        quorum={quorum}
                    />
                </div>

                <Collapse in={showVoteDetails}>
                    <div className={styles.voteBreakdown}>
                        <div className={styles.yesContainer}>
                            <VoteCount
                                width={312}
                                votes={checkedVotesFor}
                                voteState={VoteState.For}
                                voteCount={totalVotingPower}
                            />
                        </div>
                        <div className={styles.noContainer}>
                            <VoteCount
                                width={312}
                                votes={checkedVotesAgainst}
                                voteState={VoteState.Against}
                                voteCount={totalVotingPower}
                            />
                        </div>
                    </div>
                </Collapse>
            </div>

            <div className={styles.showDetailsBtn}>
                <Button
                    text={
                        !showVoteDetails
                            ? t('fields.showBreakdown')
                            : t('council.closeBreakdown')
                    }
                    onClick={onExpandClickHandler}
                    variant='transparent'
                    size='medium'
                />
            </div>
        </Card>
    )
}

export default CurrentVote
