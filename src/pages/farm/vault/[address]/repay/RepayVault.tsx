import { Button, Card, Notification } from 'components/common'
import { ActionsTooltip, Breakdown, RepayInput, RepayResponse } from 'components/fields'
import { useUpdateAccount } from 'hooks/mutations'
import { useRepayPosition } from 'hooks/queries'
import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NotificationType } from 'types/enums'

import styles from './RepayVault.module.scss'

interface Props {
  activeVault: ActiveVault
}

const RepayVault = (props: Props) => {
  const router = useRouter()
  const {
    mutate: repay,
    isLoading: isLoadingRepay,
    data: repayData,
    error: repayError,
  } = useUpdateAccount()

  const { t } = useTranslation()
  const [repayPosition, setRepayPosition] = useState<Position>(
    cloneDeep(props.activeVault.position),
  )

  const prevPosition = cloneDeep(props.activeVault.position)

  const { repayActions, repayFunds, repayFee } = useRepayPosition({
    prevPosition,
    repayPosition,
    activeVault: props.activeVault,
    isLoading: isLoadingRepay || !!repayData || !!repayError,
  })

  const handleConfirmClick = () => {
    if (!repayFee) return
    repay({
      accountId: prevPosition.accountId,
      actions: repayActions,
      fee: repayFee,
      funds: repayFunds,
    })
  }

  if (isLoadingRepay || repayData || repayError) {
    return <RepayResponse data={repayData} isLoading={isLoadingRepay} vault={props.activeVault} />
  }

  const isSameAmounts = isEqual(prevPosition.amounts, repayPosition.amounts)

  const disableConfirmBtn = !repayFee || isSameAmounts

  return (
    <>
      <Notification
        content={t('fields.notifications.repayOnly')}
        type={NotificationType.Info}
        hideCloseBtn
        showNotification={props.activeVault.position.status !== 'active'}
      />
      <Card
        title={props.activeVault.name}
        onClick={() => router.back()}
        tooltip={
          <>
            {t('fields.tooltips.editPosition')}
            <br />
            <br />
            {t('fields.tooltips.apy.available')}
          </>
        }
      >
        <RepayInput
          vault={props.activeVault}
          prevPosition={prevPosition}
          position={repayPosition}
          setPosition={setRepayPosition}
        />

        <Breakdown
          vault={props.activeVault}
          prevPosition={prevPosition}
          newPosition={repayPosition}
          isRepay
        />
        <div className={styles.actionsContainer}>
          <div className={styles.actions}>
            <Button
              onClick={handleConfirmClick}
              text={t('common.confirm')}
              disabled={disableConfirmBtn}
              className={styles.button}
            />
            {!disableConfirmBtn && (
              <ActionsTooltip
                type={'repay'}
                position={repayPosition}
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

export default RepayVault
