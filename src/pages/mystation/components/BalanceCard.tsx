import { formatValue } from '../../../libs/parse'

import styles from './BalanceCard.module.scss'

interface Props {
    title: string
    value: number
    prefix: string
    suffix: string
    style?: any
}

const BalanceCard = ({ title, value, prefix, suffix, style = {} }: Props) => {
    return (
        <div className={styles.container} style={style}>
            <div className={styles.value}>
                <span>{prefix}</span>
                <span className='h3'>
                    {formatValue(value, 2, 2, true, false, !suffix)}
                </span>
                <span>{suffix}</span>
            </div>
            <span className={`sub2 ${styles.title} `}>{title}</span>
        </div>
    )
}

export default BalanceCard
