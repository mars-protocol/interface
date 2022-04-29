import { useTable, useSortBy } from 'react-table'
import { useEffect } from 'react'
import colors from '../../styles/_assets.module.scss'
const Grid = ({
    columns,
    data,
    initialState,
    hideheader = false,
    updateSort,
}) => {
    const {
        columns: instanceColumns,
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        toggleSortBy,
    } = useTable(
        {
            columns,
            data,
            initialState,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
            sortDescFirst: true,
        },
        useSortBy
    )

    useEffect(
        () => {
            instanceColumns.forEach((column) => {
                if (column.isSorted) {
                    if (
                        initialState.sortBy[0].id !== column.id ||
                        initialState.sortBy[0].desc !== column.isSortedDesc
                    )
                        updateSort({
                            sortBy: [
                                {
                                    id: column.id,
                                    desc: column.isSortedDesc,
                                },
                            ],
                        })
                    return false
                }
            })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [rows]
    )

    useEffect(
        () => {
            instanceColumns.forEach((column) => {
                let cleared = false
                if (column.isSorted) {
                    if (
                        initialState.sortBy[0].id !== column.id ||
                        initialState.sortBy[0].desc !== column.isSortedDesc
                    ) {
                        cleared = true
                        column.clearSortBy()
                    }
                }

                if (cleared) {
                    toggleSortBy(
                        initialState.sortBy[0].id,
                        initialState.sortBy[0].desc,
                        false
                    )
                }
            })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [initialState]
    )
    return (
        <table
            {...getTableProps()}
            style={{
                tableLayout: 'fixed',
                borderSpacing: '0px',
                width: '100%',
            }}
        >
            <thead>
                <tr>
                    {headerGroups[0].headers.map((column) => {
                        return (
                            <th
                                {...column.getHeaderProps(
                                    column.getSortByToggleProps()
                                )}
                                style={{
                                    borderTop: hideheader
                                        ? 'none'
                                        : `1px solid ${colors.tableBorder}`,
                                    borderBottom: `1px solid ${colors.tableBorder}`,
                                    cursor: column.disableSortBy
                                        ? 'default'
                                        : 'pointer',
                                    width: column.width,
                                    color: colors.tableHeader, // Overwrite the .caption color to be 50% transparent
                                }}
                                className='caption'
                            >
                                {column.hideHeader || hideheader ? null : (
                                    <div
                                        style={{
                                            padding:
                                                column.headingPaddingOverride
                                                    ? column.headingPaddingOverride
                                                    : '8px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: 'flex',
                                                whiteSpace:
                                                    column.whiteSpace ||
                                                    'nowrap',
                                                textAlign:
                                                    column.textAlign ||
                                                    'inherit',
                                                justifyContent:
                                                    column.textAlign === 'right'
                                                        ? 'flex-end'
                                                        : '',
                                            }}
                                        >
                                            {column.textAlign !== 'right' &&
                                                column.render('Header')}
                                            {!column.disableSortBy ? (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        margin:
                                                            column.textAlign ===
                                                            'right'
                                                                ? 'auto 7px auto 0'
                                                                : 'auto 0 auto 7px',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            width: 0,
                                                            height: 0,
                                                            borderLeft:
                                                                '4px solid transparent',
                                                            borderRight:
                                                                '4px solid transparent',
                                                            borderBottom:
                                                                !column.disableSortBy
                                                                    ? !column.isSortedDesc &&
                                                                      column.isSorted
                                                                        ? `4px solid ${colors.tableSortActive}`
                                                                        : `4px solid ${colors.tableSort}`
                                                                    : 'none',
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            marginTop: '3px',
                                                            width: 0,
                                                            height: 0,
                                                            borderLeft:
                                                                '4px solid transparent',
                                                            borderRight:
                                                                '4px solid transparent',
                                                            borderTop:
                                                                !column.disableSortBy
                                                                    ? column.isSortedDesc &&
                                                                      column.isSorted
                                                                        ? `4px solid ${colors.tableSortActive}`
                                                                        : `4px solid ${colors.tableSort}`
                                                                    : 'none',
                                                        }}
                                                    />
                                                </div>
                                            ) : null}
                                            {column.textAlign === 'right' &&
                                                column.render('Header')}
                                        </span>
                                    </div>
                                )}
                            </th>
                        )
                    })}
                </tr>
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map((cell) => {
                                return (
                                    <td
                                        {...cell.getCellProps()}
                                        style={{
                                            textAlign: cell.column.textAlign,
                                            height: '53px',
                                            width: cell.column.width,
                                            padding: cell.column.paddingOverride
                                                ? cell.column.paddingOverride
                                                : '0 8px',
                                            borderBottom: `1px solid ${colors.tableBorder}`,
                                            overflow: cell.column.showOverflow
                                                ? 'visable'
                                                : 'hidden',
                                        }}
                                        className='body2'
                                    >
                                        {cell.render('Cell')}
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default Grid
