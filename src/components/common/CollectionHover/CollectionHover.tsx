import { DisplayCurrency } from 'components/common'
import { formatValue } from 'libs/parse'
import { useTranslation } from 'react-i18next'

import styles from './CollectionHover.module.scss'

interface Props {
  data?: HoverItem[]
  title?: string
  noPercent?: boolean
}

export const CollectionHover = ({ data, title, noPercent }: Props) => {
  const { t } = useTranslation()
  // -----------------
  // CALCULATE
  // -----------------
  const totalValue = data
    ? data.reduce((total, item) => total + (Number(item.coin.amount) || 0), 0)
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
        {item.coin.amount ? (
          <div className={styles.valueItem}>
            {item.color && <div className={styles.dot} style={{ backgroundColor: item.color }} />}
            <div className={styles.content}>
              <div className={styles.titleContainer}>
                <span className={`body ${styles.titleText}`}>{item.name}</span>
                <DisplayCurrency className={`body ${styles.titleText}`} coin={item.coin} />
              </div>

              <div className={styles.subTitleContainer}>
                <span className={`caption number ${styles.subTitleText}`}>
                  {!noPercent && producePercentage(Number(item.coin.amount), totalValue)}
                </span>
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
      {data.map((item: HoverItem, index: number) => produceItem(item, index))}
    </div>
  ) : null
}
