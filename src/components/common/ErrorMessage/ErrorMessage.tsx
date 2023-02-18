import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import styles from './ErrorMessage.module.scss'

interface Props {
  message: unknown
  alignment?: 'left' | 'center' | 'right'
}

export const ErrorMessage = (props: Props) => {
  const { t } = useTranslation()
  const classes = classNames(styles.errorMessage, props.alignment && styles[props.alignment])

  if (!props.message) return null

  if (typeof props.message === 'object') {
    return <p className={classes}>{JSON.stringify(props.message)}</p>
  }

  if (typeof props.message === 'string') {
    return <p className={classes}>{props.message}</p>
  }

  return <p className={classes}>{t('error.errorEstimatedFee')}</p>
}
