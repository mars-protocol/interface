import { Coin } from '@cosmjs/stargate'
import { BroadcastResult } from '@delphi-labs/shuttle-react'
import { Card, TxFailedContent, TxSuccessContent } from 'components/common'
import { getFeeFromResponse } from 'functions'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { TxStatus } from 'types/enums/RedBankAction'

interface Props {
  response?: BroadcastResult
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
  const chainId = useStore((s) => s.chainInfo?.chainId)
  const client = useStore((s) => s.client)
  const baseCurrency = useStore((s) => s.baseCurrency)

  useEffect(() => {
    const getTxInfo = async (hash?: string) => {
      if (txStatus !== TxStatus.LOADING) return
      if (!rpc || !chainId || !hash || !response) return

      try {
        const coin = getFeeFromResponse(response)

        if (coin) {
          setTxFee(coin)
        }

        setTxStatus(TxStatus.SUCCESS)
        onSuccess && onSuccess()
      } catch {
      } finally {
        // We get 404's until the transaction is complete.
        setCheckTxStatus(false)
      }
    }

    getTxInfo(response?.hash || undefined)
  }, [client, response, rpc, chainId, checkTxStatus, onSuccess, txStatus, baseCurrency.denom])

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
        <TxFailedContent handleClose={handleClose} hash={response?.hash || ''} message={error} />
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
