import styles from './HistoryItem.module.scss'
import colors from '../../../../styles/_assets.module.scss'

export enum ItemState {
    INACTIVE,
    ACTIVE,
    COMPLETED,
}

interface Props {
    title: string
    date: string
    state: ItemState
    primaryColor?: string
    showSeparator?: boolean
}

const HistoryItem = ({
    title,
    date,
    state,
    primaryColor = colors.success,
    showSeparator = true,
}: Props) => {
    // ---------------
    // PRESENTATION
    // ---------------

    const produceColor = (state: ItemState) => {
        return state === ItemState.ACTIVE ? primaryColor : colors.fontPrimary
    }

    const produceOpacity = (state: ItemState) => {
        return state === ItemState.INACTIVE ? 0.4 : 1
    }

    return (
        <div
            style={{ opacity: produceOpacity(state) }}
            className={styles.container}
        >
            <div className={styles.upperContainer}>
                <div className={styles.dotWrapper}>
                    <div
                        style={{ backgroundColor: produceColor(state) }}
                        className={styles.dot}
                    />
                    <div
                        style={{
                            visibility:
                                state === ItemState.ACTIVE
                                    ? 'visible'
                                    : 'hidden',
                            backgroundColor: produceColor(state),
                        }}
                        className={`${styles.dotGlow}`}
                    />
                </div>
                <span
                    style={{ color: produceColor(state) }}
                    className={`overline ${styles.title}`}
                >
                    {title}
                </span>
                {showSeparator ? <div className={styles.pointer} /> : null}
            </div>

            <span
                style={{ color: produceColor(state) }}
                className={`body2 ${styles.date}`}
            >
                {date}
            </span>
        </div>
    )
}

export default HistoryItem
