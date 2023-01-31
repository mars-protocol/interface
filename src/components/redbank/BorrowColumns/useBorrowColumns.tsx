import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { AnimatedNumber, Button, CellAmount, SVG } from 'components/common'
import Image from 'next/image'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './useBorrowColumns.module.scss'

export const useBorrowColumns = () => {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<RedBankAsset>()
  const defaultBorrowColumns: ColumnDef<RedBankAsset, any>[] = useMemo(
    () => [
      columnHelper.accessor('color', {
        enableSorting: false,
        header: '',
        cell: (info) => (
          <div
            className={`${styles.color} ${styles[info.row.original.symbol]} ${
              info.row.getIsExpanded() ? styles.expanded : ''
            }`}
          />
        ),
      }),
      columnHelper.accessor('logo', {
        enableSorting: false,
        header: '',
        cell: (info) => (
          <div className={styles.logo}>
            <Image alt='logo' height='100%' src={info.getValue().src} width='100%' />
          </div>
        ),
      }),
      columnHelper.accessor('name', {
        header: t('common.asset'),
        id: 'name',
        cell: (info) => (
          <>
            <p className='m'>{info.row.original.symbol}</p>
            <p className='s faded'>{info.getValue()}</p>
          </>
        ),
      }),
      columnHelper.accessor('borrowBalance', {
        header: t('common.borrowed'),
        cell: (info) => (
          <CellAmount
            amount={Number(info.row.original.borrowBalance)}
            decimals={info.row.original.decimals}
            denom={info.row.original.denom}
            noBalanceText={t('common.noDebt')}
          />
        ),
      }),
      columnHelper.accessor('borrowRate', {
        header: t('common.rate'),
        cell: (info) => {
          return (
            <AnimatedNumber
              amount={info.getValue()}
              suffix='%'
              abbreviated={false}
              rounded={false}
              className='m'
            />
          )
        },
      }),
      columnHelper.accessor('marketLiquidity', {
        header: t('common.marketLiquidityShort'),
        cell: (info) => (
          <CellAmount
            amount={Number(info.row.original.marketLiquidity)}
            decimals={info.row.original.decimals}
            denom={info.row.original.denom}
          />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        cell: ({ row }) => {
          return (
            <Button
              color='quaternary'
              prefix={row.getIsExpanded() ? <SVG.Collapse /> : <SVG.Expand />}
              variant='round'
            />
          )
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return defaultBorrowColumns
}
