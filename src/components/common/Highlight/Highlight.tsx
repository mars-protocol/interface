import classNames from 'classnames/bind'
import { ReactNode } from 'react'

import styles from './Highlight.module.scss'

interface Props {
  show: boolean
  children: ReactNode
  className?: string
}

export const Highlight = (props: Props) => {
  const classes = classNames([
    styles.highlight,
    props.show ? styles.show : styles.hide,
    props.className,
  ])
  return <div className={classes}>{props.children}</div>
}
