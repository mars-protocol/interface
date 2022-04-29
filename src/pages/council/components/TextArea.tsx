import styles from './TextArea.module.scss'

interface Props {
    name: string
    value: string
    rows: number
    handleInput: (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>
    ) => void
    validate?: (value: string) => void
    error?: string
    maxLength?: number
}

const TextArea = ({
    name,
    value,
    rows,
    handleInput,
    validate,
    error,
    maxLength,
}: Props) => {
    // Invoke the supplied validation method.
    const handleValidate = () => {
        if (!!validate) {
            validate(value)
        }
    }

    return (
        <div>
            <div
                className={`${styles.textAreaWrapper} ${
                    !!error ? styles.errored : ''
                }`}
            >
                <textarea
                    rows={rows}
                    onChange={(e) => handleInput(e)}
                    onBlur={handleValidate}
                    name={name}
                    value={value}
                    maxLength={maxLength}
                />
            </div>
            {!!error ? (
                <div className={`caption ${styles.error}`}>{error}</div>
            ) : null}
        </div>
    )
}

export default TextArea
