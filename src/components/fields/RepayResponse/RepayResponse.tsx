import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { TxResponse } from 'components/common'
import { useFieldsActionMessages } from 'hooks/data'
import { useRouter } from 'next/router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './RepayResponse.module.scss'

interface Props {
  data?: ExecuteResult
  error: Error | null
  isLoading: boolean
  vault: ActiveVault
}

export const RepayResponse = (props: Props) => {
  const { t } = useTranslation()
  const getVaults = useStore((s) => s.getVaults)
  const router = useRouter()
  const { repayMessage } = useFieldsActionMessages(props.data)

  const actions = [...(repayMessage ? [repayMessage] : [])]

  return (
    <div className={styles.container}>
      <TxResponse
        error={props.error?.message}
        handleClose={() => router.replace('/farm')}
        onSuccess={() => {
          getVaults({ refetch: true })
        }}
        response={props.data}
        title={t('fields.txMessages.repay')}
        actions={actions}
      />
    </div>
  )
}
