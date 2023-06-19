import { Card, CircularProgress } from 'components/common'
import { useTranslation } from 'react-i18next'

import styles from './MigrationInProgress.module.scss'

export const MigrationInProgress = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className={styles.container}>
        <Card title={t('common.migration.title')} className={styles.card}>
          <p className={styles.headline}>{t('common.migration.headline')}</p>
          <p className={styles.text}>{t('common.migration.info')}</p>
          <CircularProgress size={40} forceAnimation={true} />
        </Card>
      </div>
      <div className='background night' />
    </>
  )
}
