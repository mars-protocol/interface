import { Coin } from '@cosmjs/stargate'
import { ChainInfoID, SimpleChainInfoList, TxBroadcastResult } from '@marsprotocol/wallet-connector'
import { Button, InfoTitle, TxFee, TxLink } from 'components/common'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { TxStatus } from 'types/enums/RedBankAction'

import styles from './TxSuccessContent.module.scss'

interface Props {
  title: string
  response?: TxBroadcastResult | null
  txFee?: Coin
  txStatus: TxStatus
  actions: { label: string; values: string[] }[]
  handleClose: () => void
}

export const TxSuccessContent = ({
  response,
  txFee,
  title,
  txStatus,
  actions,
  handleClose,
}: Props) => {
  const { t } = useTranslation()
  const chainInfo = useStore((s) => s.chainInfo)
  const explorerUrl = chainInfo && SimpleChainInfoList[chainInfo.chainId as ChainInfoID].explorer
  const transactionHash = response?.hash || ''

  return (
    <div className={styles.container}>
      <div className={styles.result}>
        <div className={styles.infoContainer}>
          <InfoTitle
            src={txStatus}
            subTitle={txStatus === TxStatus.LOADING ? '' : title}
            title={
              txStatus === TxStatus.LOADING
                ? t('common.transactionPending')
                : t('common.transactionSuccessful')
            }
          />

          {response && txStatus === TxStatus.SUCCESS && (
            <div className={styles.info}>
              {actions.map((action, index) => {
                return (
                  <div key={`item-${index}`} className={styles.item}>
                    <div className={styles.label}>{action.label}</div>
                    <div>
                      {action.values.map((value, index) => (
                        <div key={`value-${index}`} className={styles.value}>
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              <div className={styles.item}>
                <span className={`${styles.label}`}>{t('common.transactionFee')}</span>
                <TxFee displayLabel={false} styleOverride={{ padding: 0 }} txFee={txFee} />
              </div>
              <div className={styles.item}>
                <div className={styles.label}>{t('common.txHash')}</div>
                <TxLink hash={transactionHash} link={`${explorerUrl}/txs/${transactionHash}`} />
              </div>
            </div>
          )}
        </div>
      </div>
      {response && txStatus === TxStatus.SUCCESS && (
        <div style={{ alignSelf: 'center', marginBottom: '32px' }}>
          <Button color='primary' disabled={false} onClick={handleClose} text={t('common.close')} />
        </div>
      )}
    </div>
  )
}
