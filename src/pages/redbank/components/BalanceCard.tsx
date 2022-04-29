import { formatValue } from '../../../libs/parse'

import styles from './BalanceCard.module.scss'

interface Props {
    title: string
    value: number
    alignRight?: boolean
}

const BalanceCard = ({ title, value, alignRight = false }: Props) => {
    return (
        <div
            className={`${styles.container} ${
                alignRight ? styles.alignRight : ''
            }`}
        >
            <div>
                <span>$</span>
                <span className='h3'>{formatValue(value)}</span>
            </div>
            <span className='sub2'>{title}</span>
        </div>
    )
}

export default BalanceCard
