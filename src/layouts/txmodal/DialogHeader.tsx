import styles from './DialogHeader.module.scss'
import { CloseSVG } from '../../components/Svg'
import Tooltip from '../../components/tooltip/Tooltip'
import { useTranslation } from 'react-i18next'

interface Props {
    handleClose: () => void
    titleText: string
}

const DialogHeader = ({ handleClose, titleText }: Props) => {
    const { t } = useTranslation()

    return (
        <div>
            <div className={styles.close} onClick={handleClose}>
                <div className={styles.button}>
                    <CloseSVG />
                </div>
            </div>
            <div className={`h6 ${styles.title}`}>{titleText}</div>
            <div className={styles.tooltip}>
                <Tooltip
                    content={t('common.dialogHeaderTooltip')}
                    iconWidth={'18px'}
                />
            </div>
        </div>
    )
}

export default DialogHeader
