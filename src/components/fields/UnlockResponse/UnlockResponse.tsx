import { TxResponse } from 'components/common'
import { useFieldsActionMessages } from 'hooks/data'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './UnlockResponse.module.scss'

interface Props {
  data?: ResultData
  isLoading: boolean
  activeVault: ActiveVault
}

export const UnlockResponse = (props: Props) => {
  const { t } = useTranslation()
  const getVaults = useStore((s) => s.getVaults)
  const router = useRouter()
  const { unlockMessages } = useFieldsActionMessages(props.data?.result, props.activeVault)

  return (
    <div className={styles.container}>
      <TxResponse
        error={props.data?.error}
        handleClose={() => router.replace('/farm')}
        onSuccess={() => getVaults({ refetch: true })}
        response={props.data?.result}
        title={t('fields.txMessages.unlock')}
        actions={unlockMessages}
      />
    </div>
  )
}
