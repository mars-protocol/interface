import styles from './PnL.module.scss'
import { formatValue } from '../../libs/parse'
import { useTranslation } from 'react-i18next'

interface Props {
    initial: string
    current: string
    pnlValue: number
}

const PnL = ({ initial, current, pnlValue }: Props) => {
    const { t } = useTranslation()

    return (
        <div className={styles.container}>
            <p className='sub2'>{t('fields.pnlBreakdown')}</p>

            <div className={styles.item}>
                <span className={styles.label}>{t('fields.initialValue')}</span>
                <span className={styles.value}>
                    {formatValue(initial, 2, 2, true, '$')}
                </span>
            </div>

            <div className={styles.item}>
                <span className={styles.label}>{t('fields.currentValue')}</span>
                <span className={styles.value}>
                    {formatValue(current, 2, 2, true, '$')}
                </span>
            </div>

            <div className={styles.item}>
                <span className={styles.label}>
                    {pnlValue >= 0 ? t('fields.profit') : t('fields.loss')}
                </span>
                <span
                    className={`${styles.value} ${
                        pnlValue > 0
                            ? 'colorInfoProfit'
                            : pnlValue < 0
                            ? 'colorInfoLoss'
                            : ''
                    }`}
                >
                    {formatValue(pnlValue, 2, 2, true, '$')}
                </span>
            </div>
        </div>
    )
}

export default PnL
