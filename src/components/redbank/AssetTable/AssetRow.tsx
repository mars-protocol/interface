import { flexRender, Row } from '@tanstack/react-table'
import classNames from 'classnames/bind'

import styles from './AssetRow.module.scss'

interface Props {
  row: Row<RedBankAsset>
  disabled?: boolean
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export const AssetRow = ({ row, disabled = false, resetExpanded }: Props) => {
  const classes = classNames.bind(styles)
  const trClasses = classes({
    tr: true,
    expanded: row.getIsExpanded(),
    disabled: disabled,
  })

  return (
    <tr
      key={row.id}
      className={trClasses}
      onClick={(e) => {
        e.preventDefault()
        const isExpanded = row.getIsExpanded()
        resetExpanded()
        !isExpanded && row.toggleExpanded()
      }}
    >
      {row.getVisibleCells().map((cell, index) => {
        const tdClasses = classes({
          td: true,
          left: cell.column.id === 'name',
          noMobile: index === 2,
        })
        return (
          <td key={cell.id} className={tdClasses}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
    </tr>
  )
}
