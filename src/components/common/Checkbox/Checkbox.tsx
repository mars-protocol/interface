import React, { useState } from 'react'

import styles from './Checkbox.module.scss'

interface Props {
  text: string
  className?: string
  onChecked: (isChecked: boolean) => void
}

export const Checkbox = (props: Props) => {
  const [isChecked, setIsChecked] = useState(false)

  const handleChange = () => {
    setIsChecked(!isChecked)
    props.onChecked(!isChecked)
  }
  return (
    <label className={`${props.className} ${styles.container}`}>
      <input type='checkbox' onChange={handleChange} className={styles.checkbox} />
      {props.text}
    </label>
  )
}
