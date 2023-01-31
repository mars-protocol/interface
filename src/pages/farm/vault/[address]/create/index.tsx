import { Button, Card } from 'components/common'
import { ActionsTooltip, Breakdown, PositionInput } from 'components/fields'
import { DEFAULT_POSITION } from 'constants/defaults'
import { useAvailableVault } from 'hooks/data'
import cloneDeep from 'lodash.clonedeep'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './CreateVault.module.scss'

const Create = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const address = String(router.query.address)
  const availableVault = useAvailableVault(address)
  const setPositionInStore = useStore((s) => s.setPosition)

  const [position, setPosition] = useState<Position>(cloneDeep(DEFAULT_POSITION))

  useEffect(() => setPositionInStore(undefined))

  if (!availableVault) {
    router.push('/farm')
    return
  }

  return (
    <Card
      title={availableVault.name}
      onClick={() => router.replace('/farm')}
      tooltip={'placeholder'}
    >
      <PositionInput vault={availableVault} position={position} setPosition={setPosition} />
      <Breakdown vault={availableVault} newPosition={position} isSetUp />
      <div className={styles.action}>
        <div className={styles.buttonContainer}>
          <Link href={`/farm/vault/${address}/create/setup`}>
            <Button
              text={t('common.setup')}
              onClick={() => setPositionInStore(position)}
              disabled={position.values.total === 0}
              className={styles.button}
            />
          </Link>
          {position.values.total !== 0 && (
            <ActionsTooltip
              type='edit'
              vault={availableVault}
              position={position}
              className={styles.tooltip}
            />
          )}
        </div>
      </div>
    </Card>
  )
}

export default Create
