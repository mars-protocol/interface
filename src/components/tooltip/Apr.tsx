import styles from './Apr.module.scss'
import { formatValue } from '../../libs/parse'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
    data: AssetInfo
    title: string
}

interface HoverItem {
    color?: string
    symbol?: string
    apr?: number
    subtitle: string
}

const Apr = ({ data }: Props) => {
    const [aprData, setAprData] = useState<HoverItem[]>([])
    const { t } = useTranslation()

    const produceData = (data: AssetInfo[]): HoverItem[] => {
        const items: HoverItem[] = []

        data.forEach((asset: AssetInfo, key: number) => {
            items.push({
                color: asset.color,
                symbol: asset.symbol,
                apr: asset.apy,
                subtitle:
                    key === 0 ? t('fields.baseApy') : t('common.incentiveApr'),
            })
        })
        return items
    }

    useEffect(
        () => {
            const baseData = data.incentive ? [data, data.incentive] : [data]
            setAprData(produceData(baseData))
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data]
    )

    const produceItem = (item: HoverItem, key: number) => {
        return (
            <div className={styles.item} key={key}>
                <div
                    className={styles.dot}
                    style={{ backgroundColor: item.color }}
                />
                <div className={styles.content}>
                    <div className={styles.titleContainer}>
                        <span className={`body ${styles.titleText}`}>
                            {item.symbol}
                        </span>
                        <span className={`body ${styles.titleText}`}>
                            {formatValue(
                                item?.apr || 0,
                                2,
                                2,
                                true,
                                false,
                                '%'
                            )}
                        </span>
                    </div>

                    <div className={styles.subTitleContainer}>
                        <span className={`caption ${styles.subTitleText}`}>
                            {item.subtitle}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <p className='sub2'>{t('fields.apyBreakdown')}</p>
            {aprData.map((item: HoverItem, index: number) =>
                produceItem(item, index)
            )}
        </div>
    )
}

export default Apr
