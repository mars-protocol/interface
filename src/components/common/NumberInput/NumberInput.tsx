import { lookup } from 'libs/parse'
import React, { useEffect, useState } from 'react'

import styles from './NumberInput.module.scss'

interface Props {
  value: string
  className: string
  maxDecimals: number
  maxValue?: number
  maxLength?: number
  suffix?: string
  onChange: (value: number) => void
  onBlur?: () => void
  onFocus?: () => void
  onRef?: (ref: React.RefObject<HTMLInputElement>) => void
}

export const NumberInput = (props: Props) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const cursorRef = React.useRef(0)
  const [inputValue, setInputValue] = useState({
    formatted: props.value,
    value: Number(props.value),
  })

  useEffect(() => {
    setInputValue({
      formatted: props.value,
      value: Number(props.value),
    })
  }, [props.value])

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
    if (props.suffix) {
      value = value.replace(props.suffix, '')
    }
    const numberCount = value.match(/[0-9]/g)?.length || 0
    const decimals = value.split('.')[1]?.length || 0
    const lastChar = value.charAt(value.length - 1)
    const isNumber = !isNaN(Number(value))
    const hasMultipleDots = (value.match(/[.,]/g)?.length || 0) > 1
    const isSeparator = lastChar === '.' || lastChar === ','

    if (isSeparator && value.length === 1) {
      updateValues('0.', 0)
      return
    }

    if (isSeparator && !hasMultipleDots) {
      updateValues(value.replace(',', '.'), inputValue.value)
      return
    }

    if (!isNumber) return
    if (hasMultipleDots) return

    if (props.maxDecimals !== undefined && decimals > props.maxDecimals) {
      value = value.substring(0, value.length - 1)
    }

    if (props.maxLength !== undefined && numberCount > props.maxLength) return

    if ((props.maxValue && Number(value) > props.maxValue) || props.maxValue === 0) {
      updateValues(String(props.maxValue), props.maxValue)
      return
    }

    if (lastChar === '0' && Number(value) === Number(inputValue.value)) {
      cursorRef.current = (inputRef.current?.selectionEnd || 0) + 1
      setInputValue({ ...inputValue, formatted: value })
      return
    }

    if (value === '') {
      updateValues(value, 0)
      return
    }

    updateValues(String(lookup(Number(value), '', 6)), Number(value))
  }

  return (
    <input
      ref={inputRef}
      type='text'
      value={`${inputValue.formatted}${props.suffix ? props.suffix : ''}`}
      onFocus={onInputFocus}
      onChange={(e) => onInputChange(e.target.value)}
      onBlur={props.onBlur}
      className={`${props.className} ${styles.input}`}
    />
  )
}
