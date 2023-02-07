import { Row } from '@tanstack/react-table'
import classNames from 'classnames/bind'
import { ValueWithLabel } from 'components/common'
import { convertPercentage, findByDenom } from 'functions'
import { magnify } from 'libs/parse'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './MetricsRow.module.scss'

interface Props {
  row: Row<RedBankAsset>
  type: 'deposit' | 'borrow'
}

export const MetricsRow = ({ row, type }: Props) => {
  const { t } = useTranslation()
  const classes = classNames.bind(styles)
  const trClasses = classes({
    tr: true,
    expanded: row.getIsExpanded(),
  })

  const marketInfo = useStore((s) => s.marketInfo)
  const denom = row.original.denom
  const totalSupplied = Number(row.original.depositLiquidity ?? 0)
  const totalBorrowed = totalSupplied - Number(row.original.marketLiquidity ?? 0)
  const liquidationThresholdPercent =
    Number(findByDenom(marketInfo, denom)?.liquidation_threshold) * 100 || 0
  const maxTVLpercent = convertPercentage(
    Number(findByDenom(marketInfo, denom)?.max_loan_to_value) * 100 || 0,
  )
  const utilizationRatePercent = convertPercentage(
    totalBorrowed === 0 ? 0 : (totalBorrowed / totalSupplied) * 100,
  )
  const isDeposit = type === 'deposit'

  return (
    <tr key={row.id} className={trClasses} onClick={() => row.toggleExpanded()}>
      <td key={row.id} className={styles.td} colSpan={7}>
        <div className={styles.wrapper}>
          <div className={styles.body}>
            <ValueWithLabel
              coin={
                isDeposit
                  ? { amount: String(totalSupplied), denom: denom }
                  : {
                      amount: String(totalBorrowed),
                      denom: denom,
                    }
              }
              label={isDeposit ? t('redbank.totalSupplied') : t('redbank.totalBorrowed')}
              orientation='left'
              prefixClass='xxs faded prefix'
              valueClass='s'
              labelClass='xs faded'
            />
            {isDeposit && (
              <>
                <ValueWithLabel
                  percent={maxTVLpercent}
                  label={t('redbank.maxLTV')}
                  orientation='left'
                  prefixClass='xxs faded prefix'
                  valueClass='s'
                  labelClass='xs faded'
                />
                <ValueWithLabel
                  percent={liquidationThresholdPercent}
                  label={t('common.liquidationThreshold')}
                  orientation='left'
                  prefixClass='xxs faded prefix'
                  valueClass='s'
                  labelClass='xs faded'
                />
              </>
            )}
            <ValueWithLabel
              coin={{
                amount: String(magnify(1, row.original.decimals)),
                denom: denom,
              }}
              label={t('common.oraclePrice')}
              orientation='left'
              prefixClass='xxs faded prefix'
              valueClass='s'
              labelClass='xs faded'
            />
            <ValueWithLabel
              percent={utilizationRatePercent}
              label={t('redbank.utilizationRate')}
              orientation='left'
              prefixClass='xxs faded prefix'
              valueClass='s'
              labelClass='xs faded'
            />
          </div>
        </div>
      </td>
    </tr>
  )
}
