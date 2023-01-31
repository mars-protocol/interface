import { AvailableVaultsTable, AvailableVaultsTableMobile } from 'components/fields'
import React from 'react'

import styles from './AvailableVaults.module.scss'

export const AvailableVaults = () => {
  return (
    <>
      <div className={styles.mobile}>
        <AvailableVaultsTableMobile />
      </div>
      <div className={styles.noMobile}>
        <AvailableVaultsTable />
      </div>
    </>
  )
}

export default AvailableVaults
