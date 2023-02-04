import classNames from 'classnames'
import { DisplayCurrency } from 'components/common'
import { AssetBar } from 'components/fields'
import { lookup } from 'libs/parse'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './BreakdownGraph.module.scss'

interface Props {
  vault: Vault
  position: Position
  isAfter?: boolean
  className?: string
}

export const BreakdownGraph = (props: Props) => {
  const { t } = useTranslation()
  const convertToDisplayCurrency = useStore((s) => s.convertToDisplayCurrency)
  const baseCurrency = useStore((s) => s.baseCurrency)
  const yAxisLimit = Math.max(props.position.values.net, props.position.values.borrowed)

  const containerClasses = classNames([
    styles.container,
    props.isAfter && styles.isAfter,
    props.className,
  ])
  const chartData = {
    bars: [
      convertToDisplayCurrency({
        amount: props.position.values.total.toString(),
        denom: props.vault.denoms.primary,
      }),
      convertToDisplayCurrency({
        amount: props.position.values.primary.toString(),
        denom: props.vault.denoms.primary,
      }),
      convertToDisplayCurrency({
        amount: props.position.values.secondary.toString(),
        denom: props.vault.denoms.primary,
      }),
      convertToDisplayCurrency({
        amount: props.position.values.borrowed.toString(),
        denom: props.vault.denoms.primary,
      }),
    ],
    labels: [props.vault.name, props.vault.symbols.secondary, props.vault.symbols.secondary],
    range: [0, lookup(yAxisLimit, props.vault.denoms.primary, 6)],
    legend: [t('common.pos'), t('common.net'), t('common.debt')],
  }

  const getBarHeightPercentage = (barIndex: number): number => {
    let height = 0
    if (barIndex === 0 && (chartData.bars[1] > 0 || chartData.bars[2] > 0)) {
      height = 1
    } else if (barIndex === 1 || barIndex === 2) {
      height = chartData.bars[barIndex] / (chartData.bars[1] + chartData.bars[2] || 1)
    } else {
      height = chartData.bars[3] / (chartData.bars[1] + chartData.bars[2] + chartData.bars[3] || 1)
    }

    return height * 100
  }

  const hasSpaceForLabel = (type: 'name' | 'primary' | 'secondary' | 'debt') => {
    const LABEL_PERCENTAGE = 25
    switch (type) {
      case 'name':
        return chartData.bars[0] * 100 > LABEL_PERCENTAGE
      case 'primary':
        return (chartData.bars[1] / chartData.bars[0]) * 100 > LABEL_PERCENTAGE
      case 'secondary':
        return (chartData.bars[2] / chartData.bars[0]) * 100 > LABEL_PERCENTAGE
      default:
        return getBarHeightPercentage(3) > 25
    }
  }

  return (
    <div className={containerClasses}>
      <div className={styles.graph}>
        <div className={styles.yAxis}>
          <DisplayCurrency
            coin={{ denom: baseCurrency.denom, amount: props.position.values.total.toString() }}
          />
          <DisplayCurrency coin={{ denom: baseCurrency.denom, amount: '0' }} />
        </div>

        <div className={styles.leftBorder}></div>
        <div className={styles.bottomBorder}></div>
        <div className={`${styles.label1} xxsCaps faded`}>{chartData.legend[0]}</div>
        <div className={`${styles.label2} xxsCaps faded`}>{chartData.legend[1]}</div>
        <div className={`${styles.label3} xxsCaps faded`}>{chartData.legend[2]}</div>

        <div className={styles.bar1} style={{ height: `${getBarHeightPercentage(0)}%` }}>
          <AssetBar
            type='name'
            symbol={props.vault.name}
            height={getBarHeightPercentage(0)}
            showLabel={hasSpaceForLabel('name')}
          />
        </div>

        <div
          className={`${styles.bar2}`}
          style={{ height: `calc(100% - ${getBarHeightPercentage(3)}%)` }}
        >
          <AssetBar
            type='primary'
            symbol={props.vault.symbols.primary}
            height={getBarHeightPercentage(1)}
            showLabel={hasSpaceForLabel('primary')}
            alignRight
          />
          <AssetBar
            type='secondary'
            symbol={props.vault.symbols.secondary}
            height={getBarHeightPercentage(2)}
            showLabel={hasSpaceForLabel('secondary')}
            alignRight
          />
        </div>
        <div className={`${styles.bar3}`} style={{ height: `${getBarHeightPercentage(3)}%` }}>
          <AssetBar
            type='debt'
            symbol={props.vault.symbols.secondary}
            height={getBarHeightPercentage(3)}
            showLabel={hasSpaceForLabel('debt')}
          />
        </div>
      </div>
    </div>
  )
}
