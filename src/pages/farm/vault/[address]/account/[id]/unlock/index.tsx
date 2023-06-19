import { Button, Card, Checkbox, SVG } from 'components/common'
import { UnlockResponse } from 'components/fields'
import { UNLOCK_DISCLAIMER_KEY } from 'constants/appConstants'
import { useActiveVault } from 'hooks/data'
import { useUpdateAccount } from 'hooks/mutations'
import { useRequestUnlockPosition } from 'hooks/queries/useRequestUnlockPosition'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

import styles from './UnlockDisclaimer.module.scss'

const Unlock = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const accountId = String(router.query.id)
  const activeVault = useActiveVault(accountId)
  const {
    mutate: requestUnlock,
    data: unlockData,
    isLoading: isLoadingUnlock,
    error: unlockError,
  } = useUpdateAccount()
  const { unlockActions, unlockFee } = useRequestUnlockPosition({
    activeVault,
    isLoading: isLoadingUnlock || !!unlockData || !!unlockError,
  })

  if (!activeVault) return <></>

  const handleChange = (isChecked: boolean) => {
    if (isChecked) {
      localStorage.setItem(UNLOCK_DISCLAIMER_KEY, 'true')
    } else {
      localStorage.removeItem(UNLOCK_DISCLAIMER_KEY)
    }
  }

  const handleUnlock = () => {
    if (!unlockFee) return

    requestUnlock({
      accountId: activeVault.position.accountId,
      actions: unlockActions,
      fee: unlockFee,
      funds: [],
    })
  }

  if (unlockData || unlockError || isLoadingUnlock) {
    return (
      <UnlockResponse data={unlockData} isLoading={isLoadingUnlock} activeVault={activeVault} />
    )
  }

  return (
    <Card title={t('error.importantInformation')} className={styles.card}>
      <div className={styles.container}>
        <SVG.LockUpDisclaimer />
        <p className={`${styles.title} xxlCaps`}>{t('fields.disclaimers.unlock.title')}</p>
        <p>
          {t('fields.disclaimers.unlock.description')}{' '}
          <a href='' rel='noreferrer' target='_blank'>
            {t('common.learnMore')}
          </a>
        </p>
        <Button
          onClick={handleUnlock}
          text={t('fields.disclaimers.unlock.button')}
          className={styles.btn}
          disabled={!unlockFee}
        />
        <Checkbox
          onChecked={handleChange}
          text={t('fields.disclaimers.dontShowAgain')}
          className={styles.checkbox}
          name='fields-disclaimer'
        />
      </div>
    </Card>
  )
}

export default Unlock
