import styles from './EndDate.module.scss'
import AccessTimeIcon from '@material-ui/icons/AccessTime'

interface Props {
    endDateFormatted: string
    fromNow: string
}

const EndDate = ({ endDateFormatted, fromNow }: Props) => {
    return (
        <div>
            <span className={styles.date}>{endDateFormatted}</span>{' '}
            <span>
                <AccessTimeIcon className={styles.container} /> {fromNow}
            </span>
        </div>
    )
}

export default EndDate
