import classNames from 'classnames'

import styles from './ErrorMessage.module.scss'

interface Props {
  errorMessage?: string
  alignment?: 'left' | 'center' | 'right'
}

export const ErrorMessage = (props: Props) => {
  const classes = classNames(styles.errorMessage, props.alignment && styles[props.alignment])

  return props.errorMessage ? <p className={classes}>{props.errorMessage}</p> : null
}
