import BalanceCard from '../../fields/components/BalanceCard'
import styles from './SeparatedBalanceCard.module.scss'

interface Props {
    title: string
    value: number
    prefix?: string
    suffix?: string
}

const SeparatedBalanceCard = ({ title, value, prefix, suffix }: Props) => {
    return (
        <div className={styles.separatedBalanceCard}>
            <div className={styles.verticalLine} />
            <div className={styles.balanceCard}>
                <BalanceCard
                    title={title}
                    value={value}
                    prefix={prefix}
                    suffix={suffix}
                    valueTextClass='body'
                />
            </div>
        </div>
    )
}

export default SeparatedBalanceCard
