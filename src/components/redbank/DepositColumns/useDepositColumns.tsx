import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import Tippy from '@tippyjs/react'
import classNames from 'classnames/bind'
import { AnimatedNumber, Apr, Button, CellAmount, SVG } from 'components/common'
import { convertPercentage } from 'functions'
import { formatValue } from 'libs/parse'
import Image from 'next/image'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './useDepositColumns.module.scss'

export const useDepositColumns = () => {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<RedBankAsset>()

  const defaultDepositColumns: ColumnDef<RedBankAsset, any>[] = useMemo(() => {
    return [
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
      columnHelper.accessor('depositBalance', {
        header: t('common.deposited'),
        cell: (info) => {
          return (
            <CellAmount
              amount={Number(info.row.original.depositBalance)}
              decimals={info.row.original.decimals}
              denom={info.row.original.denom}
              noBalanceText={t('common.noDeposit')}
            />
          )
        },
      }),
      columnHelper.accessor('apy', {
        header: t('common.apy'),
        cell: (info) => (
          <Tippy content={<Apr data={info.row.original} />}>
            <div>
              <AnimatedNumber
                amount={info.getValue() + Number(info.row.original.incentiveInfo?.apy || 0)}
                suffix='%'
                abbreviated={false}
                rounded={false}
                className='m'
              />
            </div>
          </Tippy>
        ),
      }),
      columnHelper.accessor('depositCap', {
        enableSorting: true,
        header: t('redbank.depositCap'),
        cell: ({ row }) => {
          const depositLiquidity = Number(row.original.depositLiquidity)
          const percent = convertPercentage((depositLiquidity / row.original.depositCap) * 100)
          const percentClasses = classNames(
            's',
            'number',
            'faded',
            percent >= 100 ? 'colorInfoLoss' : '',
          )

          return (
            <>
              <p className='number'>
                {formatValue(
                  row.original.depositCap / 10 ** row.original.decimals,
                  2,
                  2,
                  true,
                  false,
                )}
              </p>
              <p className={percentClasses}>
                {percent}% {t('common.used')}
              </p>
            </>
          )
        },
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
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return defaultDepositColumns
}
