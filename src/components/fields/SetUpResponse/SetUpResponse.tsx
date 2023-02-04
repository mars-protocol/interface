import { TxResponse } from 'components/common'
import { useFieldsActionMessages } from 'hooks/data'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './SetUpResponse.module.scss'

interface Props {
  data?: ResultData
  isLoading: boolean
  accountId: string
}

export const SetUpResponse = (props: Props) => {
  const { t } = useTranslation()
  const router = useRouter()
  const getVaults = useStore((s) => s.getVaults)
  const { depositMessage, borrowMessage, swapMessage } = useFieldsActionMessages(props.data?.result)

  const actions = [
    ...(depositMessage ? [depositMessage] : []),
    ...(borrowMessage ? [borrowMessage] : []),
    ...(swapMessage ? [swapMessage] : []),
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
        title={t('fields.txMessages.setup')}
        actions={actions}
      />
    </div>
  )
}
