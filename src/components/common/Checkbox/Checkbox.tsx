import classNames from 'classnames'
import { useState } from 'react'

import styles from './Checkbox.module.scss'

interface Props {
  text: string
  className?: string
  onChecked: (isChecked: boolean) => void
  name?: string
}

export const Checkbox = (props: Props) => {
  const [isChecked, setIsChecked] = useState(false)

  const handleChange = () => {
    setIsChecked(!isChecked)
    props.onChecked(!isChecked)
  }
  return (
    <div className={styles.wrapper}>
      <input
        type='checkbox'
        onChange={handleChange}
        className={styles.checkbox}
        name={`${props.name}-checkbox`}
        id={props.name}
      />
      <label htmlFor={props.name} className={classNames(props.className, styles.label)}>
        {props.text}
      </label>
    </div>
  )
}
