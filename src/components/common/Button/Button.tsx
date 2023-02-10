import classNames from 'classnames'
import { CircularProgress } from 'components/common'
import React, { ReactNode } from 'react'

import styles from './Button.module.scss'

interface Props {
  className?: any
  color?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  disabled?: boolean
  externalLink?: string
  id?: string
  suffix?: ReactNode
  prefix?: ReactNode
  showProgressIndicator?: boolean
  size?: 'small' | 'medium' | 'large'
  styleOverride?: ButtonStyleOverride
  text?: string | ReactNode
  variant?: 'solid' | 'transparent' | 'round'
  onClick?: (e: any) => void
}

export const Button = React.forwardRef<any, Props>(
  (
    {
      className = '',
      color = 'primary',
      disabled,
      externalLink,
      id = '',
      suffix,
      prefix,
      showProgressIndicator,
      size = 'small',
      styleOverride,
      text,
      variant = 'solid',
      onClick,
    },
    ref,
  ) => {
    const Button = () => {
      const buttonClasses = classNames(
        styles.button,
        styles[size],
        styles[color],
        styles[variant],
        (disabled || showProgressIndicator) && styles.disabled,
        className,
      )
      return (
        <button
          className={buttonClasses}
          id={id}
          onClick={disabled ? () => {} : onClick}
          ref={ref}
          style={styleOverride}
        >
          {prefix && !showProgressIndicator && <span className={styles.prefix}>{prefix}</span>}
          {text && (
            <span className={styles.text}>
              {showProgressIndicator ? (
                <CircularProgress size={size === 'small' ? 10 : size === 'medium' ? 12 : 18} />
              ) : (
                text
              )}
            </span>
          )}
          {suffix && !showProgressIndicator && <span className={styles.suffix}>{suffix}</span>}
        </button>
      )
    }

    return externalLink ? (
      <a
        className={styles.link}
        href={externalLink}
        ref={ref}
        rel='noopener noreferrer'
        target='_blank'
      >
        {Button()}
      </a>
    ) : (
      Button()
    )
  },
)

Button.displayName = 'Button'
