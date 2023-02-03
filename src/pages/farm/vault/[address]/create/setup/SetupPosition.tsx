import { Button, Card, SVG } from 'components/common'
import { SetUpResponse } from 'components/fields'
import { useCreateCreditAccount, useUpdateAccount } from 'hooks/mutations'
import { useEditPosition, useEstimateFarmFee } from 'hooks/queries'
import { getTimeAndUnit } from 'libs/parse'
import router from 'next/router'
import { useTranslation } from 'react-i18next'

import styles from './SetupPosition.module.scss'

interface Props {
  availableVault: Vault
  position: Position
}

const SetupPosition = (props: Props) => {
  const { t } = useTranslation()
  const timeAndUnit = getTimeAndUnit(props.availableVault.lockup)
  const {
    mutate: createCreditAccount,
    data: accountId,
    isLoading: isLoadingCreate,
  } = useCreateCreditAccount()
  const {
    mutate: enterVault,
    data: enterVaultData,
    isLoading: isLoadingEnterVault,
    error: enterVaultError,
  } = useUpdateAccount()

  const {
    editActions,
    editFunds,
    editFee,
    isLoading: isLoadingFee,
  } = useEditPosition({
    accountId: accountId,
    position: props.position,
    vault: props.availableVault,
    isReducingPosition: false,
    isLoading: isLoadingEnterVault || !!enterVaultData,
  })
  const { data: createFee } = useEstimateFarmFee({
    isCreate: true,
    isLoading: isLoadingCreate || !!accountId,
  })

  const handleCreateCreditAccountClick = () => {
    if (!createFee) return
    createCreditAccount(createFee)
  }

  const handleEnterVaultClick = () => {
    if (!accountId || !editActions || !editFee || !editFunds) return
    enterVault({ accountId, actions: editActions, fee: editFee, funds: editFunds })
  }

  if (isLoadingEnterVault || enterVaultData) {
    return (
      <SetUpResponse
        data={enterVaultData}
        isLoading={isLoadingEnterVault}
        accountId={accountId || ''}
      />
    )
  }

  return (
    <Card
      title={t('fields.setup.title')}
      tooltip={t('fields.tooltips.setupPosition')}
      onClick={() => router.back()}
      className={styles.card}
    >
      <div className={styles.container}>
        <div className={styles.section}>
          <p className='xxlCaps'>{t('fields.setup.step1.title')}</p>
          <p>{t('fields.setup.step1.text')}</p>
          <div>
            <Button
              prefix={accountId && <SVG.Check />}
              text={t('fields.setup.step1.button')}
              disabled={!!accountId || isLoadingCreate || !createFee}
              showProgressIndicator={isLoadingCreate}
              onClick={handleCreateCreditAccountClick}
              className={styles.mintBtn}
            />
            {accountId && <p className='xxsCaps'>{t('fields.setup.step1.success')}</p>}
          </div>
        </div>
        <div className={styles.section}>
          <p className='xxlCaps'>{t('fields.setup.step2.title')}</p>
          <p>{t('fields.setup.step2.text', timeAndUnit)}</p>
          <Button
            onClick={handleEnterVaultClick}
            text={t('fields.disclaimers.lockup.button', timeAndUnit)}
            disabled={!accountId || !editFee}
            className={styles.btn}
            showProgressIndicator={isLoadingEnterVault}
          />
          {!isLoadingFee && !editFee && accountId && (
            <p className='colorInfoVoteAgainst xxsCaps'>{t('fields.setup.step2.error')}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

export default SetupPosition
