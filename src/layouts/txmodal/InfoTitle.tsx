import styles from './InfoTitle.module.scss'
import { FailedSVG, SuccessSVG } from '../../components/Svg'

interface Props {
    title: string
    src: string
    subTitle: String
}
const InfoTitle = ({ title, src, subTitle }: Props) => {
    return (
        <div className={styles.container}>
            <span className={`h6`}>{title}</span>
            {src === 'failed' ? <FailedSVG /> : <SuccessSVG />}
            {subTitle.length > 0 ? (
                <span className={`h6 ${styles.subTitle}`}>{subTitle}</span>
            ) : null}
        </div>
    )
}

export default InfoTitle
