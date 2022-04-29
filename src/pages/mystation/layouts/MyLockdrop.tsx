import React, { useState } from 'react'
import Grid from '../../../components/grid/Grid'
import Tooltip from '../../../components/tooltip/Tooltip'
import styles from './MyLockdrop.module.scss'
import { CircularProgress } from '@material-ui/core'

interface Props {
    title?: string
    columns: object
    data?: any
    initialState: object
    ttCopy: string
    loaded: boolean
}

const MyLockdrop = ({
    title,
    columns,
    data,
    initialState,
    ttCopy,
    loaded,
}: Props) => {
    const columnsCached = React.useMemo(() => columns, [columns])
    const [sort, setSort] = useState(initialState)
    const changeSorting = (newSort: object) => {
        setSort(newSort)
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h6 className={styles.title}>{title}</h6>
                <div className={styles.tooltip}>
                    <Tooltip content={ttCopy} iconWidth={'18px'} />
                </div>
            </div>
            {loaded ? (
                <Grid
                    columns={columnsCached}
                    data={data}
                    initialState={sort}
                    updateSort={changeSorting}
                />
            ) : (
                <div className={styles.loading}>
                    <CircularProgress size={20} />
                </div>
            )}
        </div>
    )
}

export default MyLockdrop
