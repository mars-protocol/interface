import { SVG, WalletConnectButton } from 'components/common'
import { AvailableVaults } from 'components/fields'
import { Trans, useTranslation } from 'react-i18next'
import { DocURL } from 'types/enums/docURL'

import styles from './FieldsNotConnected.module.scss'

export const FieldsNotConnected = () => {
  const { t } = useTranslation()
  return (
    <div className={styles.notConnected}>
      <div className={styles.welcome}>
        <SVG.FieldsIcon className={styles.icon} />
        <div className={styles.title}>{t('fields.introTitle')}</div>
        <div className={styles.subTitle}>{t('fields.introDescription')}</div>
        <div className={styles.desc}>
          <div>{t('common.youveArrivedOnMars')}</div>
          <div>
            <Trans i18nKey='fields.youveArrivedOnMars'>
              <a href={DocURL.LANDING} rel='noreferrer' target='_blank'>
                Read more about Mars
              </a>
              &nbsp; or &nbsp;
              <a href={DocURL.FIELDS} rel='noreferrer' target='_blank'>
                learn how to use FIELDS
              </a>
            </Trans>
          </div>
        </div>
        <WalletConnectButton color={'secondary'} />
      </div>
      <div className={styles.vaults}>
        <AvailableVaults />
      </div>
    </div>
  )
}
