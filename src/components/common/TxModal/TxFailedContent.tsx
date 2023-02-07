import { ChainInfoID, SimpleChainInfoList } from '@marsprotocol/wallet-connector'
import { Button, TxLink } from 'components/common'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { TxStatus } from 'types/enums/RedBankAction'

import { InfoTitle } from './InfoTitle'
import styles from './TxFailedContent.module.scss'

interface Props {
  message?: string
  hash?: string
  handleClose: () => void
}

export const TxFailedContent = ({ message, hash, handleClose }: Props) => {
  const chainInfo = useStore((s) => s.chainInfo)
  const explorerUrl = chainInfo && SimpleChainInfoList[chainInfo.chainId as ChainInfoID].explorer

  const { t } = useTranslation()

  return (
    <div className={styles.container}>
      <InfoTitle src={TxStatus.FAILURE} subTitle='' title={t('common.transactionFailed')} />
      <div className={styles.failure}>
        <div className={styles.message}>{message}</div>
        {hash ? <TxLink hash={hash} link={`${explorerUrl}/txs/${hash}`} /> : null}
      </div>

      <div
        style={{
          alignSelf: 'center',
          marginBottom: '32px',
          marginTop: '32px',
        }}
      >
        <Button color='primary' disabled={false} onClick={handleClose} text={'Close'} />
      </div>
    </div>
  )
}
