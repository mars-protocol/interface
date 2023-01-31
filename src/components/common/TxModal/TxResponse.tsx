import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { decodeTxRaw } from '@cosmjs/proto-signing'
import { Coin } from '@cosmjs/stargate'
import { Card } from 'components/common'
import { TxFailedContent, TxSuccessContent } from 'components/common'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { TxStatus } from 'types/enums/RedBankAction'

interface Props {
  response?: ExecuteResult
  error?: string
  title: string
  actions?: FieldsAction[]
  handleClose: () => void
  onSuccess: () => void
}

export const TxResponse = ({
  error,
  response,
  title,
  actions = [],
  handleClose,
  onSuccess,
}: Props) => {
  const { t } = useTranslation()

  const [checkTxStatus, setCheckTxStatus] = useState(false)
  const [txFee, setTxFee] = useState<Coin>()
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.LOADING)
  const rpc = useStore((s) => s.chainInfo?.rpc)
  const chainID = useStore((s) => s.chainInfo?.chainId)
  const client = useStore((s) => s.client)

  useEffect(() => {
    const getTxInfo = async (hash: string) => {
      if (txStatus !== TxStatus.LOADING) return
      if (!rpc || !chainID) return

      try {
        const txInfoResponse = await client?.getTx(hash)

        if (txInfoResponse) {
          const decoded = decodeTxRaw(txInfoResponse?.tx)
          setTxFee(decoded.authInfo.fee?.amount[0])
        }

        setTxStatus(TxStatus.SUCCESS)
        onSuccess && onSuccess()
      } catch {
      } finally {
        // We get 404's until the transaction is complete.
        setCheckTxStatus(false)
      }
    }

    getTxInfo(response?.transactionHash || '')
  }, [client, response, rpc, chainID, checkTxStatus, onSuccess, txStatus])

  // reset scroll
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (error) setTxStatus(TxStatus.FAILURE)
  }, [error])

  const [cardTitle] = useMemo(() => {
    if (txStatus === TxStatus.FAILURE) return [t('common.failed')]
    if (txStatus === TxStatus.LOADING) return [t('common.pending')]
    return [t('common.completed'), null]
  }, [txStatus, t])

  return (
    <Card isClose={true} onClick={handleClose} title={cardTitle}>
      {txStatus === TxStatus.FAILURE ? (
        <TxFailedContent
          handleClose={handleClose}
          hash={response?.transactionHash || ''}
          message={error}
        />
      ) : (
        <TxSuccessContent
          handleClose={handleClose}
          response={response}
          title={title}
          actions={actions}
          txFee={txFee}
          txStatus={txStatus}
        />
      )}
    </Card>
  )
}

export default TxResponse
