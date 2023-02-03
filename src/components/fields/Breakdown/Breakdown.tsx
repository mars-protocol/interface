import classNames from 'classnames'
import { BreakdownGraph, BreakdownTable } from 'components/fields'
import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './Breakdown.module.scss'

interface Props {
  vault: Vault
  prevPosition?: Position
  newPosition: Position
  isRepay?: boolean
  setIsRepay?: React.Dispatch<React.SetStateAction<boolean>>
  isSetUp?: boolean
}

export const Breakdown = (props: Props) => {
  const { t } = useTranslation()

  const gridClasses = classNames([styles.grid, !props.prevPosition && styles.noChange])

  return (
    <div className={gridClasses}>
      {!props.prevPosition && <p className={`sCaps ${styles.title}`}>{t('fields.breakdown')}</p>}

      {props.prevPosition && (
        <>
          <BreakdownTable
            vault={props.vault}
            prevPosition={props.prevPosition}
            newPosition={props.prevPosition}
            isRepay={props.isRepay}
            setIsRepay={props.setIsRepay}
            className={styles.beforeTable}
          />
          <BreakdownGraph
            vault={props.vault}
            position={props.prevPosition}
            className={styles.beforeGraph}
          />
        </>
      )}

      <BreakdownTable
        vault={props.vault}
        prevPosition={props.prevPosition || props.newPosition}
        newPosition={props.newPosition}
        isRepay={props.isRepay}
        setIsRepay={props.setIsRepay}
        className={styles.afterTable}
        hideTitle={!props.prevPosition}
        isSetUp={props.isSetUp}
        isAfter
      />
      <BreakdownGraph
        vault={props.vault}
        position={props.newPosition}
        className={styles.afterGraph}
        isAfter
      />
    </div>
  )
}
