import classNames from 'classnames'
import useStore from 'store'

import styles from './CircularProgress.module.scss'

interface Props {
  color?: string
  size?: number
  className?: string
  forceAnimation?: boolean
}

export const CircularProgress = ({
  color = '#FFFFFF',
  size = 20,
  className,
  forceAnimation = false,
}: Props) => {
  const enableAnimations = useStore((s) => s.enableAnimations)
  const borderWidth = `${size / 10}px`
  const borderColor = `${color} transparent transparent transparent`
  const loaderClasses = classNames(styles.loader, className)

  if (!enableAnimations && !forceAnimation) return <div className={styles.staticLoader}>...</div>

  return (
    <div className={loaderClasses} style={{ width: `${size}px`, height: `${size}px` }}>
      <div
        className={styles.element}
        style={{
          borderWidth: borderWidth,
          borderColor: borderColor,
        }}
      />
      <div
        className={styles.element}
        style={{
          borderWidth: borderWidth,
          borderColor: borderColor,
        }}
      />
      <div
        className={styles.element}
        style={{
          borderWidth: borderWidth,
          borderColor: borderColor,
        }}
      />
      <div
        className={styles.element}
        style={{
          borderWidth: borderWidth,
          borderColor: borderColor,
        }}
      />
    </div>
  )
}
