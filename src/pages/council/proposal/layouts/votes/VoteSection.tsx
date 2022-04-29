import TxFee from '../../../../../components/TxFee'
import BalanceCard from '../../components/BalanceCard'
import styles from './VoteSection.module.scss'
import { useTranslation } from 'react-i18next'
import Button from '../../../../../components/Button'

interface Props {
    userXmarsVotingPower: number
    userVestedVotingPower: number
    submittedYes: boolean
    submittedNo: boolean
    voteForClickHandler: () => void
    voteAgainstClickHandler: () => void
    isOpen: boolean
    gasFeeFormatted: string
    canVote: boolean
}

const VoteSection = ({
    userXmarsVotingPower,
    userVestedVotingPower,
    submittedYes,
    submittedNo,
    voteForClickHandler,
    voteAgainstClickHandler,
    isOpen,
    gasFeeFormatted,
    canVote,
}: Props) => {
    const { t } = useTranslation()
    return (
        <div className={styles.container}>
            <div className={styles.balanceCard}>
                <BalanceCard
                    title={t('council.xmarsVotingPower')}
                    value={userXmarsVotingPower}
                />
            </div>

            {userVestedVotingPower > 0 && (
                <div className={styles.vestingBalanceCard}>
                    <div className={styles.balanceCard}>
                        <BalanceCard
                            title={t('council.marsVestingVotingPower')}
                            value={userVestedVotingPower}
                        />
                    </div>
                </div>
            )}

            {canVote ? (
                <div className={styles.buttonContainer}>
                    <Button
                        showProgressIndicator={submittedYes}
                        text={t('council.voteFor')}
                        onClick={voteForClickHandler}
                        styleOverride={{ marginRight: '16px', width: '128px' }}
                        disabled={!isOpen}
                        color='primary'
                    />

                    <Button
                        showProgressIndicator={submittedNo}
                        text={t('council.voteAgainst')}
                        onClick={voteAgainstClickHandler}
                        styleOverride={{ width: '128px' }}
                        disabled={!isOpen}
                        color='secondary'
                    />
                </div>
            ) : (
                <Button
                    text={t('council.votingDisabled')}
                    onClick={voteAgainstClickHandler}
                    styleOverride={{
                        width: '256px',
                        marginTop: '30px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                    disabled={true}
                    color='tertiary'
                />
            )}

            <div style={{ marginTop: '10px' }}>
                <TxFee txFee={Number(gasFeeFormatted).toFixed(2)} />
            </div>
        </div>
    )
}

export default VoteSection
