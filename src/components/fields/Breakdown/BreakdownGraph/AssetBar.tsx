import Tippy from '@tippyjs/react'
import classNames from 'classnames'

import styles from './AssetBar.module.scss'

interface Props {
  type: 'name' | 'primary' | 'secondary' | 'debt'
  symbol: string
  showLabel: boolean
  height: number
  alignRight?: boolean
}

export const AssetBar = (props: Props) => {
  const labelClasses = classNames(
    styles.label,
    props.alignRight && styles.alignRight,
    props.showLabel ? styles.show : styles.hide,
  )
  return (
    <Tippy
      content={
        !props.showLabel && props.height > 0 && <div className='tippyContainer'>{props.symbol}</div>
      }
    >
      <div className={styles[props.type]} style={{ height: `${props.height}%` }}>
        <div className={labelClasses}>{props.symbol}</div>
      </div>
    </Tippy>
  )
}
