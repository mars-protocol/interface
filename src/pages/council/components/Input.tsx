import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './Input.module.scss'

interface Props {
    name: string
    type: string
    value: string | undefined
    handleInput: (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>
    ) => void
    disabled?: boolean
    autoComplete?: string
    validate?: (value: string | undefined) => void
    error?: string
    maxLength?: number
    focusOnRender?: boolean
    onEnterHandler?: () => void
}

const Input = ({
    name,
    type,
    value,
    handleInput,
    disabled = false,
    autoComplete = 'off',
    validate,
    error,
    maxLength,
    focusOnRender = false,
    onEnterHandler,
}: Props) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [initialValidate, setInitialValidate] = useState(false)

    useEffect(() => {
        if (inputRef?.current && focusOnRender) inputRef.current.focus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Invoke the supplied validation method.
    const handleValidate = useCallback(() => {
        if (!!validate) {
            validate(value)
        }
    }, [value, validate])

    // If the component is rendered with state (value) already, then go ahead and validate it.
    useEffect(() => {
        if (!initialValidate) {
            setInitialValidate(true)
            if (!!value) {
                handleValidate()
            }
        }
    }, [value, handleValidate, initialValidate])

    return (
        <div>
            <div
                className={`${styles.inputWrapper} ${styles.text} ${
                    disabled ? styles.disabled : ''
                } ${!!error ? styles.errored : ''}`}
            >
                <input
                    className={styles.inputText}
                    onChange={(e) => handleInput(e)}
                    onBlur={handleValidate}
                    name={name}
                    type={type}
                    value={value}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    maxLength={maxLength}
                    ref={inputRef}
                    onKeyPress={(event) => {
                        if (event.key === 'Enter' && onEnterHandler) {
                            onEnterHandler()
                        }
                    }}
                />
            </div>
            {!!error ? (
                <div className={`caption ${styles.error}`}>{error}</div>
            ) : null}
        </div>
    )
}

export default Input
