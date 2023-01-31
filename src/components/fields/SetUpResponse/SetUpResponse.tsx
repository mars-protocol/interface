import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { TxResponse } from 'components/common'
import { useFieldsActionMessages } from 'hooks/data'
import { useRouter } from 'next/router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './SetUpResponse.module.scss'

interface Props {
  data?: ExecuteResult
  error: Error | null
  isLoading: boolean
  accountId: string
}

export const SetUpResponse = (props: Props) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { depositMessage, borrowMessage, swapMessage } = useFieldsActionMessages(props.data)
  const getVaults = useStore((s) => s.getVaults)

  const actions = [
    ...(depositMessage ? [depositMessage] : []),
    ...(borrowMessage ? [borrowMessage] : []),
    ...(swapMessage ? [swapMessage] : []),
  ]

  return (
    <div className={styles.container}>
      <TxResponse
        error={props.error?.message}
        handleClose={() => router.replace('/farm')}
        onSuccess={() => {
          getVaults({ refetch: true })
        }}
        response={props.data}
        title={t('fields.txMessages.setup')}
        actions={actions}
      />
    </div>
  )
}
