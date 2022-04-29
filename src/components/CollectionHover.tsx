import { formatValue } from '../libs/parse'
import styles from './CollectionHover.module.scss'
import { useTranslation } from 'react-i18next'

export interface HoverItem {
    color?: string
    name: string
    amount?: number
    usdValue?: number
    negative?: boolean
}

interface Props {
    data?: HoverItem[]
    title?: string
    noPercent?: boolean
}

const CollectionHover = ({ data, title, noPercent }: Props) => {
    const { t } = useTranslation()
    // -----------------
    // CALCULATE
    // -----------------
    const totalUsdValue = data
        ? data.reduce((total, item) => total + (item.usdValue || 0), 0)
        : 0

    const producePercentage = (fraction: number, sum: number): string => {
        if (fraction <= 0.01 || sum <= 0.01) {
            return '0.00%'
        } else {
            return formatValue((fraction / sum) * 100, 2, 2, true, false, '%')
        }
    }

    // -----------------
    // PRESENTATION
    // -----------------

    const produceItem = (item: HoverItem, key: number) => {
        return (
            <div className={styles.item} key={key}>
                {item.usdValue ? (
                    <div className={styles.valueItem}>
                        {item.color && (
                            <div
                                className={styles.dot}
                                style={{ backgroundColor: item.color }}
                            />
                        )}
                        <div className={styles.content}>
                            <div className={styles.titleContainer}>
                                <span className={`body ${styles.titleText}`}>
                                    {item.name}
                                </span>
                                <span className={`body ${styles.titleText}`}>
                                    {item.amount
                                        ? formatValue(item.amount)
                                        : formatValue(
                                              item.usdValue,
                                              2,
                                              2,
                                              true,
                                              item.negative ? '$-' : '$'
                                          )}
                                </span>
                            </div>

                            <div className={styles.subTitleContainer}>
                                <span
                                    className={`caption ${styles.subTitleText}`}
                                >
                                    {!noPercent &&
                                        producePercentage(
                                            item.usdValue,
                                            totalUsdValue
                                        )}
                                </span>
                                {item.amount && (
                                    <span
                                        className={`caption ${styles.subTitleText}`}
                                    >
                                        {formatValue(
                                            item.usdValue,
                                            2,
                                            2,
                                            true,
                                            item.negative ? '$-' : '$'
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.subHeadline}>{item.name}</div>
                )}
            </div>
        )
    }

    return data ? (
        <div className={styles.container}>
            <p className='sub2'>{title ? title : t('common.summary')}</p>
            {data.map((item: HoverItem, index: number) =>
                produceItem(item, index)
            )}
        </div>
    ) : null
}

export default CollectionHover
