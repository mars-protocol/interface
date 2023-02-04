import { Button, Card } from 'components/common'
import {
  ActionsTooltip,
  Breakdown,
  EditResponse,
  PositionInput,
  RepayInput,
  RepayResponse,
  UnlockResponse,
} from 'components/fields'
import { UNLOCK_DISCLAIMER_KEY, VAULT_DEPOSIT_BUFFER } from 'constants/appConstants'
import { useUpdateAccount } from 'hooks/mutations'
import { useEditPosition, useRepayPosition } from 'hooks/queries'
import { useRequestUnlockPosition } from 'hooks/queries/useRequestUnlockPosition'
import { getTimeAndUnit } from 'libs/parse'
import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './EditVault.module.scss'

interface Props {
  activeVault: ActiveVault
}

const EditVault = (props: Props) => {
  const router = useRouter()
  const {
    mutate: edit,
    isLoading: isLoadingEdit,
    data: editData,
    error: editError,
  } = useUpdateAccount()
  const {
    mutate: repay,
    isLoading: isLoadingRepay,
    data: repayData,
    error: repayError,
  } = useUpdateAccount()
  const {
    mutate: requestUnlock,
    isLoading: isLoadingUnlock,
    data: unlockData,
    error: unlockError,
  } = useUpdateAccount()

  const { t } = useTranslation()
  const [position, setPosition] = useState<Position>(cloneDeep(props.activeVault.position))
  const [repayPosition, setRepayPosition] = useState<Position>(
    cloneDeep(props.activeVault.position),
  )
  const [isRepay, setIsRepay] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const showDisclaimer = !localStorage.getItem(UNLOCK_DISCLAIMER_KEY)
  const prevPosition = cloneDeep(props.activeVault.position)
  const lockupTimeAndUnit = getTimeAndUnit(props.activeVault.lockup)

  const isReducingPosition = useMemo(
    () => prevPosition.values.total > position.values.total,
    [prevPosition.values.total, position.values.total],
  )

  const { repayActions, repayFunds, repayFee } = useRepayPosition({
    prevPosition,
    repayPosition,
    activeVault: props.activeVault,
    isLoading,
  })

  const { editActions, editFunds, editFee } = useEditPosition({
    accountId: props.activeVault.position.accountId,
    prevPosition,
    position,
    vault: props.activeVault,
    isReducingPosition,
    isLoading,
  })

  const { unlockActions, unlockFee } = useRequestUnlockPosition({
    activeVault: props.activeVault,
    isLoading,
  })

  const handleConfirmClick = () => {
    setIsLoading(true)
    if (isRepay && repayFee) {
      repay({
        accountId: prevPosition.accountId,
        actions: repayActions,
        fee: repayFee,
        funds: repayFunds,
      })
    } else if (!isRepay && editFee) {
      edit({
        accountId: prevPosition.accountId,
        actions: editActions,
        fee: editFee,
        funds: editFunds,
      })
    }
  }

  const handleUnlockClick = useCallback(() => {
    if (!unlockFee) return
    if (showDisclaimer) {
      router.push(`/farm/vault/${props.activeVault.address}/unlock`)
      return
    }

    requestUnlock({
      accountId: prevPosition.accountId,
      actions: unlockActions,
      fee: unlockFee,
      funds: [],
    })
  }, [
    props.activeVault.address,
    showDisclaimer,
    router,
    unlockFee,
    prevPosition.accountId,
    requestUnlock,
    unlockActions,
  ])

  const actionButtons = useMemo(
    () => (
      <>
        {prevPosition.amounts.borrowed > 0 && (
          <Button
            onClick={() => setIsRepay(!isRepay)}
            text={isRepay ? t('fields.managePosition') : t('fields.repayDebt')}
            color='tertiary'
            styleOverride={{ marginRight: '12px' }}
          />
        )}
        <Button
          onClick={handleUnlockClick}
          text={t('fields.unlockBtn', {
            time: lockupTimeAndUnit.time || 0,
            unit: lockupTimeAndUnit.unit[0],
          })}
          color='tertiary'
          disabled={!unlockFee}
        />
      </>
    ),
    [
      t,
      handleUnlockClick,
      isRepay,
      unlockFee,
      setIsRepay,
      lockupTimeAndUnit.time,
      lockupTimeAndUnit.unit,
      prevPosition.amounts.borrowed,
    ],
  )

  if (isLoadingEdit || editData || editError) {
    return (
      <EditResponse data={editData} isLoading={isLoadingEdit} activeVault={props.activeVault} />
    )
  }

  if (isLoadingRepay || repayData || repayError) {
    return <RepayResponse data={repayData} isLoading={isLoadingRepay} vault={props.activeVault} />
  }

  if (isLoadingUnlock || unlockData || unlockError) {
    return (
      <UnlockResponse
        data={unlockData}
        isLoading={isLoadingUnlock}
        activeVault={props.activeVault}
      />
    )
  }

  const additionalPositionValue = position.values.total - prevPosition.values.total
  const isVaultCapReached = props.activeVault.vaultCap
    ? props.activeVault.vaultCap.used + additionalPositionValue >
      props.activeVault.vaultCap.max * VAULT_DEPOSIT_BUFFER
    : false

  const isReducingAnyAsset =
    !isRepay &&
    (prevPosition.amounts.primary > position.amounts.primary ||
      prevPosition.amounts.secondary > position.amounts.secondary ||
      prevPosition.amounts.borrowed > position.amounts.borrowed)

  const isNotRepaying = isRepay && repayPosition.amounts.borrowed >= prevPosition.amounts.borrowed
  const isWithoutFee = (!isRepay && !editFee) || (isRepay && !repayFee)
  const isSameAmounts =
    (isEqual(prevPosition.amounts, position.amounts) && !isRepay) ||
    (isEqual(prevPosition.amounts, repayPosition.amounts) && isRepay)

  const disableConfirmBtn =
    isNotRepaying || isVaultCapReached || isReducingAnyAsset || isWithoutFee || isSameAmounts
  const disableUnlockBtn = !unlockFee
  const showUnlockBtn =
    (prevPosition.amounts.primary > position.amounts.primary ||
      prevPosition.amounts.secondary > position.amounts.secondary) &&
    !isRepay

  return (
    <>
      <div className={styles.actionButtons}>{actionButtons}</div>
      <Card
        title={props.activeVault.name}
        onClick={() => router.back()}
        tooltip={t('fields.tooltips.editPosition')}
        actionButtons={actionButtons}
      >
        {isRepay ? (
          <RepayInput
            vault={props.activeVault}
            prevPosition={prevPosition}
            position={repayPosition}
            setPosition={setRepayPosition}
          />
        ) : (
          <PositionInput
            vault={props.activeVault}
            position={position}
            prevPosition={prevPosition}
            setPosition={setPosition}
          />
        )}

        <Breakdown
          vault={props.activeVault}
          prevPosition={prevPosition}
          newPosition={isRepay ? repayPosition : position}
          isRepay={isRepay}
          setIsRepay={setIsRepay}
        />
        <div className={styles.actionsContainer}>
          <div className={styles.actions}>
            <Button
              onClick={handleConfirmClick}
              text={t('common.confirm')}
              disabled={disableConfirmBtn}
              className={styles.button}
            />
            {showUnlockBtn && (
              <Button
                onClick={handleUnlockClick}
                text={t('fields.unlockBtn', {
                  time: lockupTimeAndUnit.time || 0,
                  unit: lockupTimeAndUnit.unit[0],
                })}
                disabled={disableUnlockBtn}
                color='secondary'
                className={styles.button}
              />
            )}
            {((showUnlockBtn && !disableUnlockBtn) || !disableConfirmBtn) && (
              <ActionsTooltip
                type={isRepay ? 'repay' : showUnlockBtn ? 'unlock' : 'edit'}
                position={position}
                prevPosition={prevPosition}
                repayAmount={prevPosition.amounts.borrowed - repayPosition.amounts.borrowed}
                vault={props.activeVault}
                className={styles.tooltip}
              />
            )}
          </div>
        </div>
      </Card>
    </>
  )
}

export default EditVault
