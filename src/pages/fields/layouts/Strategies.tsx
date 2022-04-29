import React, { ReactNode, useState } from 'react'

import Grid from '../../../components/grid/Grid'
import Tooltip from '../../../components/tooltip/Tooltip'

import styles from './Strategies.module.scss'
import { CircularProgress } from '@material-ui/core'
import { Trans, useTranslation } from 'react-i18next'
import Card from '../../../components/card/Card'
import { DocURL } from '../../../types/enums/DocURL.enum'

interface Props {
    title?: string
    columns: object
    data?: StrategyObject[]
    initialState: object
    ttCopy: string | ReactNode
    separator?: string
    showMore?: boolean
    loaded: boolean
    active: boolean
}

const Strategies = ({
    title,
    columns,
    data,
    initialState,
    ttCopy,
    separator,
    showMore = false,
    loaded,
    active = false,
}: Props) => {
    const columnsCached = React.useMemo(() => columns, [columns])
    const { t } = useTranslation()

    const [sort, setSort] = useState(initialState)
    const changeSorting = (newSort: object) => {
        setSort(newSort)
    }

    return (
        <Card>
            <div
                className={
                    active
                        ? `${styles.container} ${styles.active}`
                        : styles.container
                }
            >
                <div className={styles.header}>
                    <h6 className={styles.title}>{title}</h6>
                    <div className={styles.tooltip}>
                        <Tooltip content={ttCopy} iconWidth={'18px'} />
                    </div>
                </div>

                {loaded ? (
                    <>
                        {data?.length ? (
                            <Grid
                                columns={columnsCached}
                                data={data}
                                initialState={sort}
                                updateSort={changeSorting}
                            />
                        ) : (
                            <>
                                <Grid
                                    columns={columnsCached}
                                    data={[]}
                                    initialState={sort}
                                    updateSort={() => {}}
                                />
                                <div className={styles.noData}>
                                    {separator
                                        ? t(
                                              'fields.youDontHaveTheRequiredAssets'
                                          )
                                        : t(
                                              'fields.youDontHaveAnyActiveStrategy'
                                          )}
                                </div>
                                <div className={styles.tutorial}>
                                    <Trans i18nKey='fields.clickOnFarm'>
                                        Click on Farm below to start.
                                        <a href={DocURL.FIELDS}>Learn how</a>
                                    </Trans>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className={styles.loading}>
                        <CircularProgress size={20} />
                    </div>
                )}
                {showMore ? (
                    <div className={styles.showmore}>
                        <span>{t('common.showAll')}</span>
                    </div>
                ) : (
                    <div className={styles.footer} />
                )}
            </div>
        </Card>
    )
}

export default Strategies
