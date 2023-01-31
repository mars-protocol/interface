import styles from './Toggle.module.scss'

interface Props {
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export const Toggle = ({ name, checked, onChange }: Props) => {
  return (
    <div className={styles.toggle}>
      <input
        type='checkbox'
        id={name}
        name={name}
        className={styles.checkbox}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={name} className={styles.label}>
        <span className={styles.handle} />
      </label>
    </div>
  )
}
