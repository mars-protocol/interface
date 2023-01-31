import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { TxResponse } from 'components/common'
import { useFieldsActionMessages } from 'hooks/data'
import { useRouter } from 'next/router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './UnlockResponse.module.scss'

interface Props {
  data?: ExecuteResult
  error: Error | null
  isLoading: boolean
  activeVault: ActiveVault
}

export const UnlockResponse = (props: Props) => {
  const { t } = useTranslation()
  const getVaults = useStore((s) => s.getVaults)
  const router = useRouter()
  const { unlockMessages } = useFieldsActionMessages(props.data, props.activeVault)

  return (
    <div className={styles.container}>
      <TxResponse
        error={props.error?.message}
        handleClose={() => router.replace('/farm')}
        onSuccess={() => getVaults({ refetch: true })}
        response={props.data}
        title={t('fields.txMessages.unlock')}
        actions={unlockMessages}
      />
    </div>
  )
}
