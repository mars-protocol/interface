import React, { ReactNode, useEffect, useState } from 'react'

import Grid from '../../../components/grid/Grid'
import Tooltip from '../../../components/tooltip/Tooltip'

import styles from './Markets.module.scss'
import { useTranslation } from 'react-i18next'

interface Props {
    title?: string
    notInvestedMessage?: ReactNode
    separator?: string
    columns: object
    data: AssetInfo[]
    initialState: object
    activeDataFilter?: (asset: AssetInfo) => boolean
    defaultDisplayCount?: number
    hideNotInvested?: boolean
    updateSort?: any
    tooltip: string | ReactNode
}

const Markets = ({
    title,
    notInvestedMessage,
    separator,
    columns,
    data,
    initialState,
    activeDataFilter,
    defaultDisplayCount = 10,
    hideNotInvested,
    updateSort,
    tooltip,
}: Props) => {
    const { t } = useTranslation()
    const [expanded, setExpanded] = useState(false)
    const [displayData, setDisplayData] = useState(data)

    useEffect(() => {
        if (!expanded) {
            setDisplayData(data.slice(0, defaultDisplayCount))
        } else {
            setDisplayData(data)
        }
    }, [expanded, data, defaultDisplayCount])
    const isExpandable = data.length > defaultDisplayCount

    const activeAssetsData = activeDataFilter
        ? displayData.filter((asset) => activeDataFilter(asset))
        : displayData

    const nonActiveAssetsData = displayData.filter(
        (asset) => !activeAssetsData.includes(asset)
    )

    const activeAssetsDataCached = React.useMemo(
        () => activeAssetsData,
        [activeAssetsData]
    )
    const nonActiveAssetsDataCached = React.useMemo(
        () => nonActiveAssetsData,
        [nonActiveAssetsData]
    )

    const [sort, setSort] = useState(initialState)
    const changeSorting = (newSort: object) => {
        setSort(newSort)
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h6 className={styles.title}>{title}</h6>
                <div className={styles.tooltip}>
                    <Tooltip content={tooltip} iconWidth={'18px'} />
                </div>
            </div>

            <Grid
                updateSort={changeSorting}
                columns={columns}
                data={activeAssetsDataCached}
                initialState={sort}
            />

            {!activeAssetsDataCached.length &&
            !hideNotInvested &&
            notInvestedMessage ? (
                <div className={styles.notInvested}>
                    <div>{notInvestedMessage}</div>
                </div>
            ) : null}

            {nonActiveAssetsDataCached.length ? (
                <div>
                    <div className={styles.separator}>
                        <div className={styles.horizontalLine} />
                        <div className={`${styles.text} overline`}>
                            {separator}
                        </div>
                        <div className={styles.horizontalLine} />
                    </div>

                    <Grid
                        hideheader={true}
                        columns={columns}
                        data={nonActiveAssetsDataCached}
                        initialState={sort}
                        updateSort={() => {}}
                    />
                </div>
            ) : null}

            <div
                className={`${styles.footer} ${
                    isExpandable ? styles.expandable : null
                }`}
                onClick={
                    isExpandable ? () => setExpanded(!expanded) : undefined
                }
            >
                {isExpandable ? (
                    <div>{expanded ? t('showLess') : t('common.showAll')}</div>
                ) : null}
            </div>
        </div>
    )
}

export default Markets
