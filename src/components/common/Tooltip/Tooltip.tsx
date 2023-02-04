import Tippy from '@tippyjs/react'
import classNames from 'classnames'
import { SVG } from 'components/common'
import { ReactNode } from 'react'

import styles from './Tooltip.module.scss'

interface Props {
  content: string | ReactNode
  className?: string
}

export const Tooltip = (props: Props) => {
  const classes = classNames([styles.iconContainer, styles.iconColor, props.className])

  return (
    <Tippy appendTo={() => document.body} className={'tippyContainer'} content={props.content}>
      <div className={classes}>
        <SVG.Tooltip className={styles.icon} />
      </div>
    </Tippy>
  )
}
