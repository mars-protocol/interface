import { Button, Card } from 'components/common'
import { ActionsTooltip, Breakdown, PositionInput } from 'components/fields'
import { VAULT_DEPOSIT_BUFFER } from 'constants/appConstants'
import { DEFAULT_POSITION } from 'constants/defaults'
import { useAvailableVault } from 'hooks/data'
import cloneDeep from 'lodash.clonedeep'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './CreateVault.module.scss'

const Create = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const address = String(router.query.address)
  const availableVault = useAvailableVault(address)
  const setPositionInStore = useStore((s) => s.setPosition)
  const convertToBaseCurrency = useStore((s) => s.convertToBaseCurrency)

  const [position, setPosition] = useState<Position>(cloneDeep(DEFAULT_POSITION))

  useEffect(() => setPositionInStore(undefined))

  if (!availableVault) {
    router.push('/farm')
    return
  }

  const handleSetupClick = () => {
    setPositionInStore(position)
    router.push(`/farm/vault/${address}/create/setup`)
  }

  const vaultCapValue = convertToBaseCurrency({
    amount: ((availableVault.vaultCap?.max || 0) * VAULT_DEPOSIT_BUFFER).toString(),
    denom: availableVault.vaultCap?.denom || '',
  })

  const vaultCapUsedValue = convertToBaseCurrency({
    amount: (availableVault.vaultCap?.used || 0).toString(),
    denom: availableVault.vaultCap?.denom || '',
  })

  const isVaultCapReached = availableVault.vaultCap
    ? vaultCapUsedValue + position.values.total > vaultCapValue
    : false

  const isDisabled = position.values.total === 0 || isVaultCapReached

  return (
    <Card
      title={t('fields.vaultName', availableVault.name)}
      onClick={() => router.replace('/farm')}
      tooltip={
        <>
          {t('fields.tooltips.editPosition')}
          <br />
          <br />
          {t('fields.tooltips.apy.available')}
        </>
      }
    >
      <PositionInput vault={availableVault} position={position} setPosition={setPosition} />
      <Breakdown vault={availableVault} newPosition={position} isSetUp />
      <div className={styles.action}>
        <div className={styles.buttonContainer}>
          <Button
            text={t('common.setup')}
            onClick={handleSetupClick}
            disabled={isDisabled}
            className={styles.button}
          />
          {!isDisabled && (
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
