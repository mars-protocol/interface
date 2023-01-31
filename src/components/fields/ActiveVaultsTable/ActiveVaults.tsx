import { ActiveVaultsTable, ActiveVaultsTableMobile } from 'components/fields'
import React from 'react'

import styles from './ActiveVaults.module.scss'

export const ActiveVaults = () => {
  return (
    <>
      <div className={styles.mobile}>
        <ActiveVaultsTableMobile />
      </div>
      <div className={styles.noMobile}>
        <ActiveVaultsTable />
      </div>
    </>
  )
}
