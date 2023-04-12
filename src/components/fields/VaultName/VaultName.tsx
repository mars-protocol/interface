import { formatCooldown, produceCountdown } from 'libs/parse'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  vault: Vault
  position?: ActiveVault
}

export const VaultName = (props: Props) => {
  const { t } = useTranslation()
  let subText = ''
  switch (props.position?.position?.status) {
    case 'unlocked':
      subText = t('common.unlocked')
      break
    case 'unlocking':
      subText = produceCountdown(3456787)
      break
    default:
      subText = t('fields.xDayLockup', { time: formatCooldown(props.vault.lockup) })
  }

  return (
    <>
      <p className='m'>{t('fields.vaultName', props.vault.name)}</p>
      <p
        className={`s ${
          props.position?.position?.status === 'unlocked' ? 'colorInfoVoteAgainst' : 'faded'
        }`}
      >
        {subText}
      </p>
    </>
  )
}
