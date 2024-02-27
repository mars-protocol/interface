import BigNumber from 'bignumber.js'
import React, { useCallback, useEffect, useState } from 'react'

import styles from './NumberInput.module.scss'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })

interface Props {
  value: number
  className: string
  decimals: number
  maxDecimals: number
  minValue?: number
  maxValue?: number
  maxLength?: number
  allowNegative?: boolean
  suffix?: string
  style?: {}
  placeholder?: string
  onChange: (value: number) => void
  onBlur?: () => void
  onFocus?: () => void
  onRef?: (ref: React.RefObject<HTMLInputElement>) => void
}

export const NumberInput = (props: Props) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const cursorRef = React.useRef(0)

  const magnifyValue = (value: string) => {
    return new BigNumber(value).shiftedBy(props.decimals).toString()
  }

  const minifyValue = useCallback(
    (value: string) => {
      return new BigNumber(value).shiftedBy(-1 * props.decimals).toString()
    },
    [props.decimals],
  )

  const [inputValue, setInputValue] = useState({
    formatted: minifyValue(props.value.toString()),
    value: props.value,
  })

  const clearDots = (value: string) => {
    const regex = new RegExp(/\.\./g)
    if (regex.test(value)) {
      const search = '.'
      const replaceWith = ''
      value = value.split(search).join(replaceWith)
    }

    return value
  }

  useEffect(() => {
    setInputValue({
      formatted: minifyValue(props.value.toString()),
      value: Number(props.value),
    })
  }, [props.value, minifyValue])

  useEffect(() => {
    if (!props.onRef) return
    props.onRef(inputRef)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputRef, props.onRef])

  const onInputFocus = () => {
    inputRef.current?.select()
    props.onFocus && props.onFocus()
  }

  const updateValues = (formatted: string, value: number) => {
    const lastChar = formatted.charAt(formatted.length - 1)
    if (lastChar === '.') {
      cursorRef.current = (inputRef.current?.selectionEnd || 0) + 1
    } else {
      cursorRef.current = inputRef.current?.selectionEnd || 0
    }
    setInputValue({ formatted, value })
    if (value !== inputValue.value) {
      props.onChange(value)
    }
  }

  useEffect(() => {
    if (!inputRef.current) return

    const cursor = cursorRef.current
    const length = inputValue.formatted.length

    if (cursor > length) {
      inputRef.current.setSelectionRange(length, length)
      return
    }

    inputRef.current.setSelectionRange(cursor, cursor)
  }, [inputValue, inputRef])

  const onInputChange = (value: string) => {
    if (props.placeholder) {
      value = clearDots(value)
    }

    if (props.suffix) {
      value = value.replace(' ' + props.suffix, '')
    }

    const numberCount = value.match(/[0-9]/g)?.length || 0
    const decimals = value.split('.')[1]?.length || 0
    const lastChar = value.charAt(value.length - 1)
    const isNumber = !isNaN(Number(value))
    const hasMultipleDots = (value.match(/[.,]/g)?.length || 0) > 1
    const isSeparator = lastChar === '.' || lastChar === ','
    const isNegative = value.indexOf('-') > -1
    const isLowerThanMinimum = props.minValue !== undefined && Number(value) < props.minValue
    const isHigherThanMaximum = props.maxValue !== undefined && Number(value) > props.maxValue
    const isTooLong = props.maxLength !== undefined && numberCount > props.maxLength
    const exceedsMaxDecimals = props.maxDecimals !== undefined && decimals > props.maxDecimals

    if (isNegative && !props.allowNegative) return

    if (isSeparator && value.length === 1) {
      updateValues('0.', 0)
      return
    }

    if (isSeparator && !hasMultipleDots) {
      updateValues(value.replace(',', '.'), inputValue.value)
      return
    }

    if (!isNumber || hasMultipleDots) return

    if (exceedsMaxDecimals) {
      value = value.substring(0, value.length - 1)
    }

    if (isTooLong) return

    if (isLowerThanMinimum) {
      updateValues(String(props.minValue), props.minValue!)
      return
    }

    if (isHigherThanMaximum) {
      updateValues(String(props.maxValue), props.maxValue!)
      return
    }

    if (lastChar === '0' && Number(value) === Number(inputValue.value)) {
      cursorRef.current = (inputRef.current?.selectionEnd || 0) + 1
      setInputValue({ ...inputValue, formatted: value })
      return
    }

    if (!value) {
      updateValues(value, 0)
      return
    }

    if (Number(value) === 0) {
      updateValues(value, 0)
      return
    }

    updateValues(value, Number(magnifyValue(value)))
  }

  return (
    <input
      ref={inputRef}
      type='text'
      value={
        props.placeholder && !props.value
          ? props.placeholder
          : `${inputValue.formatted ? inputValue.formatted : ''}${
              props.suffix ? ' ' + props.suffix : ''
            }`
      }
      onFocus={onInputFocus}
      onChange={(e) => onInputChange(e.target.value)}
      onBlur={props.onBlur}
      className={`${styles.input} ${props.className}`}
      style={props.style}
    />
  )
}
