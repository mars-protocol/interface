import CircularProgress from '@material-ui/core/CircularProgress'
import TxLink from './TxLink'
import styles from './TxWaitContent.module.scss'
import DialogHeader from './DialogHeader'
import { TxResult } from '@terra-money/wallet-provider'
import { useTranslation } from 'react-i18next'
import useStore from '../../store'

interface Props {
    response?: TxResult
    handleClose: () => void
}

const TxWaitContent = ({ response, handleClose }: Props) => {
    const { t } = useTranslation()
    const getFinderUrl = useStore((s) => s.getFinderUrl)

    return (
        <div className={styles.container}>
            <DialogHeader
                handleClose={handleClose}
                titleText={t('common.txPending')}
            />

            <div className={styles.wait}>
                <div className={styles.title}>
                    <CircularProgress color='inherit' />
                    <div className={styles.text}>
                        {t('common.waitingForReceipt')}
                    </div>
                </div>
                <div className={styles.link}>
                    <TxLink
                        hash={response?.result?.txhash || ''}
                        link={getFinderUrl(
                            response?.result?.txhash || '',
                            'tx'
                        )}
                    />
                </div>
            </div>
        </div>
    )
}

export default TxWaitContent
