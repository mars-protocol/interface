import React, { ReactNode, useState } from 'react'
import Grid from '../../../components/grid/Grid'
import Tooltip from '../../../components/tooltip/Tooltip'
import styles from './Markets.module.scss'

interface Props {
    title?: string
    columns: object
    data: AssetInfo[]
    initialState: object
    tooltip: string | ReactNode
    activeDataFilter: (asset: AssetInfo) => boolean
}

const Markets = ({
    title,
    columns,
    data,
    initialState,
    tooltip,
    activeDataFilter,
}: Props) => {
    const activeAssetsData = data.filter((asset) => activeDataFilter(asset))
    const columnsCached = React.useMemo(() => columns, [columns])
    const activeAssetsDataCached = React.useMemo(
        () => activeAssetsData,
        [activeAssetsData]
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
                columns={columnsCached}
                data={activeAssetsDataCached}
                initialState={sort}
                updateSort={changeSorting}
            />
            <div className={styles.footer} />
        </div>
    )
}

export default Markets
