import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames/bind'
import { SVG } from 'components/common'
import { ActionsRow, AssetRow, MetricsRow } from 'components/redbank'
import React from 'react'

import styles from './AssetTable.module.scss'
interface Props {
  columns: ColumnDef<RedBankAsset, any>[]
  data: RedBankAsset[]
  type: 'deposit' | 'borrow'
  disabled?: boolean
}

export const AssetTable = ({ data, columns, type, disabled = false }: Props) => {
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: `${type}Balance`,
      desc: true,
    },
  ])
  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      sorting,
    },
    autoResetExpanded: false,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    getSubRows: (row) => row.subRows,
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  })
  const classes = classNames.bind(styles)

  if (!columns || !data.length) return <></>

  return (
    <table className={styles.table}>
      <thead className={styles.thead}>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, index) => {
              const thClasses = classes({
                th: true,
                canSort: header.column.getCanSort(),
                disabled: disabled,
                noMobile: index === 1,
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
          if (row.depth === 1) {
            return (
              <React.Fragment key={`${row.id}_subrow`}>
                <ActionsRow key={`${row.id}_actions`} row={table.getRow(row.id[0])} type={type} />
                <MetricsRow key={`${row.id}_metrics`} row={table.getRow(row.id[0])} type={type} />
              </React.Fragment>
            )
          }
          return (
            <AssetRow
              key={`${row.id}_asset`}
              disabled={false}
              resetExpanded={table.resetExpanded}
              row={row}
            />
          )
        })}
      </tbody>
    </table>
  )
}
