import classNames from 'classnames'
import { SVG, Tooltip } from 'components/common'
import { ReactNode } from 'react'

import styles from './Card.module.scss'

interface Props {
  title: string
  tooltip?: string | ReactNode
  hideHeaderBorder?: boolean
  children?: ReactNode
  styleOverride?: object
  isClose?: boolean
  className?: string
  actionButtons?: ReactNode
  onClick?: () => void
}

export const Card = ({
  title,
  tooltip,
  hideHeaderBorder = false,
  children,
  styleOverride,
  isClose = false,
  className,
  actionButtons,
  onClick,
}: Props) => {
  const headerClasses = classNames(styles.header, !hideHeaderBorder && styles.border)
  const buttonClasses = classNames(styles.button, !isClose && styles.back)
  return (
    <div className={`${styles.container} ${className}`} style={styleOverride}>
      <div className={headerClasses}>
        {onClick && (
          <button className={buttonClasses} onClick={onClick}>
            {isClose ? <SVG.Close /> : <SVG.ArrowBack />}
          </button>
        )}
        <h6>{title}</h6>
        {actionButtons && <div className={styles.actions}>{actionButtons}</div>}
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      {children}
    </div>
  )
}
