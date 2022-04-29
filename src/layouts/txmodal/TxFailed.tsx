import TxLink from './TxLink'
import Header from './Header'

import styles from './TxFailed.module.scss'
import InfoTitle from './InfoTitle'
import Button from '../../components/Button'
import { useTranslation } from 'react-i18next'
import useStore from '../../store'

interface Props {
    message: string
    hash?: string
    handleClose: () => void
    exitImgSrc?: string
}

const TxFailedContent = ({
    message,
    hash,
    handleClose,
    exitImgSrc = 'close',
}: Props) => {
    const getFinderUrl = useStore((s) => s.getFinderUrl)
    const { t } = useTranslation()

    return (
        <div className={styles.container}>
            <Header
                src={exitImgSrc}
                handleClose={handleClose}
                titleText={'FAILED'}
                tooltip={t('common.txTooltip')}
            />
            <InfoTitle title='Transaction Failed' src={'failed'} subTitle='' />
            <div className={styles.failure}>
                <div className={styles.message}>{message}</div>
                {hash ? (
                    <TxLink hash={hash} link={getFinderUrl(hash, 'tx')} />
                ) : null}
            </div>

            <div
                style={{
                    alignSelf: 'center',
                    marginBottom: '32px',
                    marginTop: '32px',
                }}
            >
                <Button
                    disabled={false}
                    text={'Close'}
                    onClick={handleClose}
                    color='primary'
                />
            </div>
        </div>
    )
}

export default TxFailedContent
