import { useState, useEffect, ReactNode } from 'react'
import { LCDClient, TxInfo } from '@terra-money/terra.js'
import { TxResult, UserDenied } from '@terra-money/wallet-provider'
import TxWaitContent from './TxWaitContent'
import TxFailedContent from './TxFailed'
import TxResultContent, { PostError } from './TxResultContent'
import { useInterval } from '../../hooks'
import useErrorMessage from '../../hooks/useErrorMessage'
import useStore from '../../store'

export enum STATUS {
    SUCCESS = 'success',
    LOADING = 'loading',
    FAILURE = 'failure',
}

interface Props {
    response?: TxResult
    error?: PostError
    denom: string
    decimals: number
    amount: string
    supplyAmount?: number
    borrowAmount?: number
    assets?: WhitelistAsset[]
    txFee: string
    handleClose: () => void
    handleBack?: () => void
    exitImgSrc?: string
    label: string
    refetchQueries?: Array<() => void>
    title?: ReactNode
}

const TxResponse = ({
    error,
    response,
    denom,
    decimals,
    amount,
    supplyAmount,
    borrowAmount,
    assets,
    txFee,
    handleClose,
    handleBack,
    label,
    exitImgSrc,
    refetchQueries = [],
    title,
}: Props) => {
    const lcd = useStore((s) => s.networkConfig?.lcd)
    const chainID = useStore((s) => s.networkConfig?.chainID)
    const [txInfo, setTxInfo] = useState<TxInfo>()
    const [checkTxStatus, setCheckTxStatus] = useState(false)
    const txStatus =
        !response?.success || error || txInfo?.code
            ? STATUS.FAILURE
            : !txInfo
            ? STATUS.LOADING
            : STATUS.SUCCESS

    const faliureMessage = useErrorMessage(
        txInfo?.raw_log ||
            response?.result?.raw_log ||
            error?.message ||
            (error instanceof UserDenied && 'Denied by the user') ||
            ''
    )

    useInterval(
        () => {
            setCheckTxStatus(true)
        },
        txStatus === STATUS.LOADING ? 1000 : null
    )
    useEffect(() => {
        const getTxInfo = async (hash: string) => {
            if (!lcd || !chainID) return
            const terra = new LCDClient({
                URL: lcd,
                chainID: chainID,
            })

            try {
                const txInfoResponse = await terra.tx.txInfo(hash)
                setTxInfo(txInfoResponse)
            } catch {
            } finally {
                // We get 404's until the transaction is complete.
                setCheckTxStatus(false)
            }
        }

        getTxInfo(response?.result?.txhash || '')
    }, [response?.result?.txhash, lcd, chainID, checkTxStatus])

    // reset scroll
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div>
            {txStatus === STATUS.LOADING ? (
                <TxWaitContent response={response} handleClose={handleClose} />
            ) : txStatus === STATUS.FAILURE ? (
                <TxFailedContent
                    message={faliureMessage}
                    hash={response?.result?.txhash || ''}
                    handleClose={handleBack || handleClose}
                    exitImgSrc={exitImgSrc}
                />
            ) : (
                <TxResultContent
                    response={response}
                    denom={denom}
                    decimals={decimals}
                    amount={amount}
                    assets={assets}
                    supplyAmount={supplyAmount}
                    borrowAmount={borrowAmount}
                    txFee={txFee}
                    handleClose={handleClose}
                    label={label}
                    refetchQueries={refetchQueries}
                    title={title}
                />
            )}
        </div>
    )
}

export default TxResponse
