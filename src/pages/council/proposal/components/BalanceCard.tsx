import { XMARS_DECIMALS, XMARS_DENOM } from '../../../../constants/appConstants'
import { formatValue, lookup } from '../../../../libs/parse'
import styles from './BalanceCard.module.scss'

interface Props {
    value: number
    suffix?: string
    title: string
}

const BalanceCard = ({ value, title, suffix = ' xMARS' }: Props) => {
    return (
        <div className={styles.container}>
            <span className={`overline ${styles.title} `}>{title}</span>
            <div className={styles.value}>
                <span className='h3'>
                    {formatValue(
                        lookup(value, XMARS_DENOM, XMARS_DECIMALS),
                        2,
                        2,
                        true,
                        false,
                        !suffix
                    )}
                </span>
                <span>{suffix}</span>
            </div>
        </div>
    )
}

export default BalanceCard
