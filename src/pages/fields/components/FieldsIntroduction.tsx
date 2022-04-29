import { useTranslation } from 'react-i18next'
import { FieldsIntroSVG } from '../../../components/Svg'
import styles from './FieldsIntroduction.module.scss'
import Button from '../../../components/Button'
import { ExternalSVG } from '../../../components/Svg'

const FieldsIntroduction = () => {
    const { t } = useTranslation()
    return (
        <div className={styles.container}>
            <FieldsIntroSVG />
            <h1 className={`h4 ${styles.heading}`}>{t('fields.introTitle')}</h1>
            <p className={`h5 ${styles.paragraph}`}>
                {t('fields.introDescription')}
            </p>
            <Button
                text={t('fields.introButton')}
                color='secondary'
                suffix={<ExternalSVG />}
                externalLink='https://mars-protocol.medium.com/guide-to-the-fields-of-mars-22e6e4e04125'
                className={styles.link}
            />
        </div>
    )
}

export default FieldsIntroduction
