import React from 'react'

import styles from './Loading.module.scss'

interface Props {
  style?: React.CSSProperties
}

export const Loading = (props: Props) => {
  return (
    <div className={styles.loading} style={props.style}>
      ...
    </div>
  )
}
