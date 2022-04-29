import { formatValue } from '../libs/parse'
import { useTranslation } from 'react-i18next'

interface Props {
    gasFeeFormatted: string
    taxFormatted: string
}

const TxFeeToolTip = ({ gasFeeFormatted, taxFormatted }: Props) => {
    const { t } = useTranslation()
    return (
        <div style={{ fontSize: '0.8rem' }}>
            <div style={{ display: 'flex' }}>
                <span style={{ flex: 'auto', marginRight: '6px' }}>
                    {t('common.gas')}
                </span>
                <span>
                    {formatValue(
                        gasFeeFormatted,
                        2,
                        2,
                        true,
                        false,
                        ' UST',
                        true
                    )}
                </span>
            </div>
            <div style={{ display: 'flex' }}>
                <span style={{ flex: 'auto', marginRight: '6px' }}>
                    {t('common.stability')}
                </span>
                <span>
                    {formatValue(taxFormatted, 2, 2, true, false, ' UST', true)}
                </span>
            </div>
        </div>
    )
}

export default TxFeeToolTip
