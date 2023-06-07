import classNames from 'classnames'
import { Button, Card, Checkbox } from 'components/common'
import { TERMS_OF_SERVICE } from 'constants/appConstants'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import useStore from 'store'
import { DocURL } from 'types/enums/docURL'

import styles from './TermsOfService.module.scss'

export const TermsOfService = () => {
  const { t } = useTranslation()
  const [isFirstAccepted, setIsFirstAccepted] = useState(false)
  const [isSecondAccepted, setIsSecondAccepted] = useState(false)

  const onTermsConfirmed = () => {
    if (!isFirstAccepted && !isSecondAccepted) return

    localStorage.setItem(TERMS_OF_SERVICE, 'true')
    useStore.setState({ acceptedTermsOfService: true })
  }

  return (
    <div className={styles.container}>
      <Card title='Disclaimer' className={styles.card}>
        <div className={classNames('xs', styles.subtitle)}>
          <Trans i18nKey='common.termsOfService.intro'>
            <span className={classNames('faded xs')}>
              Please check the boxes below to confirm your agreement to the{' '}
            </span>
            <a
              href={DocURL.TERMS_OF_SERVICE_URL}
              rel='noreferrer'
              target='_blank'
              className={classNames('xs')}
            >
              Mars Protocol Terms and Conditions
            </a>
          </Trans>
        </div>
        <Checkbox
          className={styles.checkbox}
          onChecked={(isChecked) => setIsFirstAccepted(isChecked)}
          text={t('common.termsOfService.term1')}
        />
        <Checkbox
          className={styles.checkbox}
          onChecked={(isChecked) => setIsSecondAccepted(isChecked)}
          text={t('common.termsOfService.term2')}
        />
        <Button
          onClick={onTermsConfirmed}
          text={t('common.confirm')}
          disabled={!isFirstAccepted || !isSecondAccepted}
          className={styles.btn}
        />
      </Card>
    </div>
  )
}
