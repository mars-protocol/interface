import styles from './TxFee.module.scss'
import { useTranslation } from 'react-i18next'
import { formatValue } from '../libs/parse'

interface Props {
    txFee: string
    styleOverride?: any
}

const TxFee = ({ txFee, styleOverride = {} }: Props) => {
    const { t } = useTranslation()
    return (
        <div className={styles.txFee}>
            <div className={`overline ${styles.label}`} style={styleOverride}>
                <span>{t('common.txFee')}</span>
            </div>
            <div className={`overline ${styles.value}`} style={styleOverride}>
                {formatValue(txFee, 2, 2, true, false, ' UST', true)}
            </div>
        </div>
    )
}

export default TxFee
