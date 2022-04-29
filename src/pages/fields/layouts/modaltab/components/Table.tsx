import isEqual from 'lodash.isequal'
import React from 'react'
import { formatValue, lookup } from '../../../../../libs/parse'
import { assetData } from './input-section/InputSection'
import styles from './Table.module.scss'

interface TableProps {
    header: string
    primaryAsset: assetData
    secondaryAsset: assetData
    isFarm?: boolean
    rows: Row[]
}

interface Row {
    title: string
    primaryAmount?: number
    secondaryAmount?: number
    primaryChange?: number
    secondaryChange?: number
    primaryValue?: number
    secondaryValue?: number
    isBorrow?: boolean
}

const Table = React.memo(
    ({ header, primaryAsset, secondaryAsset, isFarm, rows }: TableProps) => {
        const getChangeColor = (
            change: number,
            isBorrow: boolean | undefined
        ): string => {
            if (isFarm) return styles.none
            if (isBorrow) change *= -1
            if (change > 0) {
                return styles.primary
            } else if (change < 0) {
                return styles.red
            } else {
                return styles.invisible
            }
        }

        return (
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th colSpan={5} className={styles.header}>
                            {header}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <>
                            <tr className={styles.mobileTitle}>
                                <td colSpan={5}>{row.title}</td>
                            </tr>
                            <tr className={styles.row}>
                                <td className={styles.title}>{row.title}</td>
                                <td className={styles.amount}>
                                    {row.primaryAmount !== undefined &&
                                        formatValue(
                                            lookup(
                                                row.primaryAmount,
                                                primaryAsset.denom,
                                                primaryAsset.decimals
                                            ),
                                            2,
                                            2,
                                            true,
                                            false,
                                            false
                                        )}
                                    {row.primaryAmount !== undefined &&
                                        row.secondaryAmount !== undefined && (
                                            <br></br>
                                        )}
                                    {row.secondaryAmount !== undefined &&
                                        formatValue(
                                            lookup(
                                                row.secondaryAmount,
                                                secondaryAsset.denom,
                                                secondaryAsset.decimals
                                            ),
                                            2,
                                            2,
                                            true,
                                            false,
                                            false
                                        )}
                                </td>
                                <td className={styles.denom}>
                                    {row.primaryAmount !== undefined &&
                                        primaryAsset.symbol}
                                    {row.primaryAmount !== undefined &&
                                        row.secondaryAmount !== undefined && (
                                            <br></br>
                                        )}
                                    {row.secondaryAmount !== undefined &&
                                        secondaryAsset.symbol}
                                </td>
                                <td className={`${styles.change}`}>
                                    {row.primaryChange !== undefined && (
                                        <span
                                            className={getChangeColor(
                                                row.primaryChange,
                                                row.isBorrow
                                            )}
                                        >
                                            ({row.primaryChange > 0 && '+'}
                                            {formatValue(
                                                lookup(
                                                    row.primaryChange,
                                                    primaryAsset.denom,
                                                    primaryAsset.decimals
                                                ),
                                                0,
                                                2,
                                                true
                                            )}
                                            )
                                        </span>
                                    )}
                                    {row.primaryChange !== undefined &&
                                        row.secondaryChange !== undefined && (
                                            <br></br>
                                        )}
                                    {row.secondaryChange !== undefined && (
                                        <span
                                            className={getChangeColor(
                                                row.secondaryChange,
                                                row.isBorrow
                                            )}
                                        >
                                            ({row.secondaryChange > 0 && '+'}
                                            {formatValue(
                                                lookup(
                                                    row.secondaryChange,
                                                    secondaryAsset.denom,
                                                    secondaryAsset.decimals
                                                ),
                                                0,
                                                2,
                                                true
                                            )}
                                            )
                                        </span>
                                    )}
                                </td>
                                <td className={styles.value}>
                                    {row.primaryValue !== undefined &&
                                        formatValue(
                                            lookup(
                                                row.primaryValue,
                                                primaryAsset.denom,
                                                primaryAsset.decimals
                                            ),
                                            2,
                                            2,
                                            true,
                                            '$',
                                            false
                                        )}
                                    {row.primaryValue !== undefined &&
                                        row.secondaryValue !== undefined && (
                                            <br></br>
                                        )}
                                    {row.secondaryValue !== undefined &&
                                        formatValue(
                                            lookup(
                                                row.secondaryValue,
                                                secondaryAsset.denom,
                                                secondaryAsset.decimals
                                            ),
                                            2,
                                            2,
                                            true,
                                            '$',
                                            false
                                        )}
                                </td>
                            </tr>
                        </>
                    ))}
                </tbody>
            </table>
        )
    },
    (prev, next) => {
        return isEqual(prev, next)
    }
)

export default Table
