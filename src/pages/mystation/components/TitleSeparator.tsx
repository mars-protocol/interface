import styles from './TitleSeparator.module.scss'

interface Props {
    title: string
}
const TitleSeparator = ({ title }: Props) => {
    return (
        <div className={styles.title}>
            <div className={styles.horizontalLine} />
            <h6>{title}</h6>
            <div className={styles.horizontalLine} />
        </div>
    )
}

export default TitleSeparator
