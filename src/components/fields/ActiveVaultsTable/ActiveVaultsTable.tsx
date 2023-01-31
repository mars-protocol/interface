import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames/bind'
import { Card, SVG } from 'components/common'
import { FIELDS_TUTORIAL_KEY } from 'constants/appConstants'
import { useRouter } from 'next/router'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './ActiveVaultsTable.module.scss'
import useActiveVaultsColumns from './useActiveVaultsColumns'

export const ActiveVaultsTable = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { defaultActiveVaultsColumns } = useActiveVaultsColumns()
  const activeVaults = useStore((s) => s.activeVaults)

  if (activeVaults.length && !localStorage.getItem(FIELDS_TUTORIAL_KEY)) {
    localStorage.setItem(FIELDS_TUTORIAL_KEY, 'true')
  }

  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'apy',
      desc: true,
    },
  ])

  const table = useReactTable({
    data: activeVaults || [],
    columns: defaultActiveVaultsColumns,
    state: {
      sorting,
    },
    autoResetExpanded: false,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  })

  const classes = classNames.bind(styles)

  if (!activeVaults.length) return null

  const handleRowClick = (vault: ActiveVault) => {
    switch (vault.position.status) {
      case 'active':
        router.push(`/farm/vault/${vault.address}/edit`)
        return
      case 'unlocked':
        router.push(`/farm/vault/${vault.address}/close`)
        return
      case 'unlocking':
        router.push(`/farm/vault/${vault.address}/repay`)
        return
    }
  }

  return (
    <Card
      title={t('fields.activeVaults')}
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
                  left: header.id === 'name',
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
              <tr key={row.id} className={styles.tr} onClick={() => handleRowClick(row.original)}>
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
