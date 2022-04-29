import { ReactNode } from 'react'
import styles from './InfoCard.module.scss'

interface Props {
    titleText: string
    detailsText: string | ReactNode
    link?: string
}

const InfoCard = ({ titleText, detailsText, link }: Props) => {
    return (
        <div className={styles.container}>
            <span className={`caption ${styles.title}`}>{titleText}</span>
            {link ? (
                <span
                    className={`body2 ${styles.clickable}`}
                    onClick={() => {
                        window.open(link, '_blank')
                    }}
                >
                    {detailsText}
                </span>
            ) : (
                <span className={`body2 `}>{detailsText}</span>
            )}
        </div>
    )
}

export default InfoCard
