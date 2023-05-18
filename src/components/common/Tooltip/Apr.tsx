import { formatValue } from 'libs/parse'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './Apr.module.scss'

interface Props {
  data: RedBankAsset
}

interface HoverItem {
  color?: string
  symbol?: string
  apr?: number
  subtitle: string
}

export const Apr = ({ data }: Props) => {
  const [aprData, setAprData] = useState<HoverItem[]>([])
  const { t } = useTranslation()

  const produceData = (data: IncentiveInfo[]): HoverItem[] => {
    const items: HoverItem[] = []

    data.forEach((asset: IncentiveInfo, key: number) => {
      if (key !== 0 && !asset.apy) return
      items.push({
        color: asset.color,
        symbol: asset.symbol,
        apr: asset.apy,
        subtitle: key === 0 ? t('incentives.interestApr') : t('incentives.depositRewards'),
      })
    })
    return items
  }

  useEffect(
    () => {
      const baseData = data.incentiveInfo ? [data, data.incentiveInfo] : [data]
      setAprData(produceData(baseData))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  )

  const produceItem = (item: HoverItem, key: number) => {
    return (
      <div key={key} className={styles.item}>
        <div className={styles.dot} style={{ backgroundColor: item.color }} />
        <div className={styles.content}>
          <div className={styles.titleContainer}>
            <span className={`body ${styles.titleText}`}>{item.symbol}</span>
            <span className={`body number ${styles.titleText}`}>
              {formatValue(item?.apr || 0, 2, 2, true, false, '%', false, false)}
            </span>
          </div>

          <div className={styles.subTitleContainer}>
            <span className={`caption ${styles.subTitleText}`}>{item.subtitle}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <p className='sub2'>{t('fields.apyBreakdown')}</p>
      {aprData.map((item: HoverItem, index: number) => produceItem(item, index))}
    </div>
  )
}
