import moment from 'moment'
import HistoryItem, { ItemState } from '../components/HistoryItem'
import styles from './History.module.scss'
import { useTranslation } from 'react-i18next'
import colors from '../../../../styles/_assets.module.scss'

interface Props {
    status: string
    startDate: string
}

const History = ({ status, startDate }: Props) => {
    const ACTIVE = 0
    const SUCCEEDED = 1
    const FAILED = 2
    const QUEUED = 3
    const EXECUTED = 4

    const { t } = useTranslation()

    const produceState = (status: string) => {
        switch (status) {
            case 'active':
                return ACTIVE
            case 'passed':
                return SUCCEEDED
            case 'rejected':
                return FAILED
            case 'council.queued':
                return QUEUED
            case 'executed':
                return EXECUTED
        }
        return 4
    }

    const proposalState = produceState(status)
    const todaysDate = moment().format('DD/MM/YY')

    return (
        <div className={styles.container}>
            <span className={`caption ${styles.title}`}>Proposal History</span>

            <div className={styles.itemWrapper}>
                <div className={styles.item}>
                    <HistoryItem
                        title={t('council.created')}
                        date={startDate}
                        state={ItemState.COMPLETED}
                    />
                </div>
                <div className={styles.item}>
                    <HistoryItem
                        title={t('common.active')}
                        date={proposalState === 0 ? todaysDate : ''} // todo add end date here
                        state={
                            proposalState === 0
                                ? ItemState.ACTIVE
                                : ItemState.COMPLETED
                        }
                    />
                </div>
                <div className={styles.item}>
                    <HistoryItem
                        title={
                            proposalState === FAILED
                                ? t('common.failed')
                                : t('common.succeeded')
                        }
                        date=''
                        state={
                            proposalState === SUCCEEDED ||
                            proposalState === FAILED
                                ? ItemState.ACTIVE
                                : proposalState > FAILED
                                ? ItemState.COMPLETED
                                : ItemState.INACTIVE
                        }
                        primaryColor={
                            proposalState === SUCCEEDED
                                ? colors.success
                                : colors.failure
                        }
                    />
                </div>
                <div className={styles.item}>
                    <HistoryItem
                        title={t('council.queued')}
                        date=''
                        state={
                            proposalState === QUEUED
                                ? ItemState.ACTIVE
                                : proposalState > QUEUED
                                ? ItemState.COMPLETED
                                : ItemState.INACTIVE
                        }
                    />
                </div>
                <div className={styles.item}>
                    <HistoryItem
                        title={t('council.executed')}
                        date=''
                        state={
                            proposalState === EXECUTED
                                ? ItemState.ACTIVE
                                : proposalState > EXECUTED
                                ? ItemState.COMPLETED
                                : ItemState.INACTIVE
                        }
                        showSeparator={false}
                    />
                </div>
            </div>
        </div>
    )
}

export default History
