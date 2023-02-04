import { TxResponse } from 'components/common'
import { useFieldsActionMessages } from 'hooks/data'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './ClosePositionResponse.module.scss'

interface Props {
  data?: ResultData
  isLoading: boolean
  accountId: string
}

export const ClosePositionResponse = (props: Props) => {
  const { t } = useTranslation()
  const router = useRouter()
  const getVaults = useStore((s) => s.getVaults)

  const { repayMessage, withdrawMessage } = useFieldsActionMessages(props.data?.result)

  const actions = [
    ...(repayMessage ? [repayMessage] : []),
    ...(withdrawMessage ? [withdrawMessage] : []),
  ]

  return (
    <div className={styles.container}>
      <TxResponse
        error={props.data?.error}
        handleClose={() => router.replace('/farm')}
        onSuccess={() => {
          getVaults({ refetch: true })
        }}
        response={props.data?.result}
        title={t('fields.txMessages.close')}
        actions={actions}
      />
    </div>
  )
}
