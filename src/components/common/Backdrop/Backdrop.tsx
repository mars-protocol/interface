import classNames from 'classnames/bind'

import styles from './Backdrop.module.scss'

interface Props {
  show: boolean
}

export const Backdrop = (props: Props) => {
  const classes = classNames(styles.backdrop, props.show ? styles.show : styles.hide)
  return <div className={classes} />
}
