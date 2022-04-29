import styles from './BalanceCard.module.scss'
import { formatValue } from '../../../libs/parse'

interface Props {
    title: string
    value: number
    prefix?: string
    suffix?: string
    overline?: boolean
    valueTextClass?: string
}

const BalanceCard = ({
    title,
    value,
    prefix = '$',
    suffix,
    overline = false,
    valueTextClass,
}: Props) => {
    const percent = suffix === '%'
    return (
        <div className={styles.container}>
            {overline && (
                <span className={`sub2 ${styles.title} `}>{title}</span>
            )}
            <div className={styles.value}>
                {prefix && <span>{prefix}</span>}
                <span
                    className={`${valueTextClass ? valueTextClass : 'h3'} ${
                        styles.valueItem
                    }`}
                >
                    {formatValue(
                        value,
                        2,
                        2,
                        true,
                        false,
                        !(percent || suffix),
                        percent
                    )}
                </span>
                {suffix && <span>{suffix}</span>}
            </div>
            {!overline && (
                <span className={`sub2 ${styles.title} `}>{title}</span>
            )}
        </div>
    )
}

export default BalanceCard
