import { ReactNode } from 'react'
import styles from './CooldownBreakdown.module.scss'

interface Props {
    title: string
    content: string | ReactNode
}

const CooldownBreakdown = ({ title, content }: Props) => {
    return (
        <div className={styles.breakdownItem}>
            <span className={`overline ${styles.breakdownTitle}`}>{title}</span>
            <span className={'h4'}>{content}</span>
        </div>
    )
}

export default CooldownBreakdown
