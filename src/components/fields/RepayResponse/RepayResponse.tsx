import { TxResponse } from 'components/common'
import { useFieldsActionMessages } from 'hooks/data'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './RepayResponse.module.scss'

interface Props {
  data?: ResultData
  isLoading: boolean
  vault: ActiveVault
}

export const RepayResponse = (props: Props) => {
  const { t } = useTranslation()
  const getVaults = useStore((s) => s.getVaults)
  const router = useRouter()
  const { repayMessage } = useFieldsActionMessages(props.data?.result)

  const actions = [...(repayMessage ? [repayMessage] : [])]

  return (
    <div className={styles.container}>
      <TxResponse
        error={props.data?.error}
        handleClose={() => router.replace('/farm')}
        onSuccess={() => {
          getVaults({ refetch: true })
        }}
        response={props.data?.result}
        title={t('fields.txMessages.repay')}
        actions={actions}
      />
    </div>
  )
}
