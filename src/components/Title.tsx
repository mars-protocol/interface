import styles from './Title.module.scss'

interface Props {
    text: string
    margin?: string
}

const Title = ({ text, margin }: Props) => {
    return (
        <div className={styles.title}>
            <div className={styles.horizontalLine} />
            <h6 style={{ margin: margin || '0 40px' }}>{text}</h6>
            <div className={styles.horizontalLine} />
        </div>
    )
}

export default Title
