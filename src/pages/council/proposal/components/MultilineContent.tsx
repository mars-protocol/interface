import styles from './MultilineContent.module.scss'

interface Props {
    content: string
}

const MultilineContent = ({ content }: Props) => {
    // We split on newlines to generate each individually as they are ignored by browser
    const contentArray = content.split(/\n/g)

    return (
        <span>
            {contentArray.map((value: string, index: number) => {
                return (
                    <span
                        className={`body2  ${styles.multilineContent} `}
                        key={index}
                    >
                        {value}
                    </span>
                )
            })}
        </span>
    )
}

export default MultilineContent
