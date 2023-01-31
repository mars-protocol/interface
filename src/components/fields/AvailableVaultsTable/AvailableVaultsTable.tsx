import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames/bind'
import { Card, SVG } from 'components/common'
import { useAvailableVaultsColumns } from 'components/fields'
import { useRouter } from 'next/router'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './AvailableVaultsTable.module.scss'

export const AvailableVaultsTable = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { defaultAvailableVaultsColumns } = useAvailableVaultsColumns()
  const availableVaults = useStore((s) => s.availableVaults)

  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'apy',
      desc: true,
    },
  ])

  const table = useReactTable({
    data: availableVaults || [],
    columns: defaultAvailableVaultsColumns,
    state: {
      sorting,
    },
    autoResetExpanded: false,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  })

  const classes = classNames.bind(styles)

  if (!availableVaults.length) return null

  const handleRowClick = (address: string) => {
    router.push(`/farm/vault/${address}/create`)
  }

  return (
    <Card
      title={t('fields.availableVaults')}
      hideHeaderBorder
      styleOverride={{ marginBottom: 40 }}
      tooltip={<Trans i18nKey='fields.tooltips.activeVaults' />}
    >
      <table className={styles.table}>
        <thead className={styles.thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const thClasses = classes({
                  th: true,
                  canSort: header.column.getCanSort(),
                  disabled: false,
                })
                const wrapperClasses = classes({
                  wrapper: true,
                  left: header.id === 'name' || header.id === 'description',
                  center: header.id === 'provider_name',
                })

                return (
                  <th
                    key={header.id}
                    className={thClasses}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <>
                      <div className={wrapperClasses}>
                        {header.column.getCanSort()
                          ? {
                              asc: <SVG.SortAsc />,
                              desc: <SVG.SortDesc />,
                              false: <SVG.SortNone />,
                            }[header.column.getIsSorted() as string] ?? null
                          : null}
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    </>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr
                key={row.id}
                className={styles.tr}
                onClick={() => handleRowClick(row.original.address)}
              >
                {row.getVisibleCells().map((cell) => {
                  const tdClasses = classes({
                    td: true,
                    left: cell.column.id === 'name',
                  })
                  return (
                    <td key={cell.id} className={tdClasses}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
