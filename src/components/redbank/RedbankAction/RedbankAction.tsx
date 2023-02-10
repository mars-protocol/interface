import { TxBroadcastResult } from '@marsprotocol/wallet-connector'
import { useQueryClient } from '@tanstack/react-query'
import { Action, Notification, TxResponse } from 'components/common'
import { findByDenom } from 'functions'
import {
  getRedbankBorrowMsgOptions,
  getRedbankDepositMsgOptions,
  getRedbankRepayMsgOptions,
  getRedbankWithdrawMsgOptions,
} from 'functions/messages'
import { useEstimateFee } from 'hooks/queries'
import { ltvWeightedDepositValue, maintainanceMarginWeightedDepositValue } from 'libs/assetInfo'
import { lookup, lookupDecimals } from 'libs/parse'
import isEqual from 'lodash.isequal'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { NotificationType, ViewType } from 'types/enums'
import { QUERY_KEYS } from 'types/enums/queryKeys'

import styles from './RedbankAction.module.scss'

interface Props {
  activeView: ViewType
  symbol: string
}

export const RedbankAction = React.memo(
  ({ activeView, symbol }: Props) => {
    // ------------------
    // EXTERNAL HOOKS
    // ------------------
    const { t } = useTranslation()
    const router = useRouter()
    const queryClient = useQueryClient()

    // ------------------
    // STORE STATE
    // ------------------
    const client = useStore((s) => s.client)
    const marketInfo = useStore((s) => s.marketInfo)
    const networkConfig = useStore((s) => s.networkConfig)
    const otherAssets = useStore((s) => s.otherAssets)
    const redBankAssets = useStore((s) => s.redBankAssets)
    const userBalances = useStore((s) => s.userBalances)
    const userCollateral = useStore((s) => s.userCollateral)
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const executeMsg = useStore((s) => s.executeMsg)

    // ------------------
    // LOCAL STATE
    // ------------------
    const [amount, setAmount] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [response, setResponse] = useState<TxBroadcastResult>()
    const [error, setError] = useState<string>()
    const [isMax, setIsMax] = useState<boolean>(false)
    const [capHit, setCapHit] = useState<boolean>(false)

    // ------------------
    // VARIABLES
    // ------------------
    const assets = [...whitelistedAssets, ...otherAssets]
    const denom = assets.find((asset) => asset.symbol === symbol)?.denom || ''
    const decimals = lookupDecimals(denom, whitelistedAssets || []) || 6
    const walletBallance = Number(findByDenom(userBalances, denom)?.amount.toString())

    // Read only states
    const borrowAssetName = redBankAssets.find((asset) => asset.denom === denom)
    const redBankContractAddress = networkConfig?.contracts.redBank
    const totalScaledDepositbaseCurrencyBalance = useMemo(() => {
      if (!userCollateral) return 0
      return ltvWeightedDepositValue(
        redBankAssets,
        marketInfo,
        userCollateral,
        'depositBalanceBaseCurrency',
      )
    }, [redBankAssets, marketInfo, userCollateral])

    const totalMMScaledDepositbaseCurrencyBalance = useMemo(() => {
      if (!userCollateral) return 0
      return maintainanceMarginWeightedDepositValue(
        redBankAssets,
        marketInfo,
        userCollateral,
        'depositBalanceBaseCurrency',
      )
    }, [redBankAssets, marketInfo, userCollateral])

    const totalBorrowBaseCurrencyAmount = redBankAssets.reduce(
      (total, asset) => total + (Number(asset.borrowBalanceBaseCurrency) || 0),
      0,
    )

    // --------------------------------
    // Transaction objects
    // --------------------------------

    const txMsgOptions = useMemo(() => {
      if (!redBankContractAddress || amount <= 0 || !denom) return

      switch (activeView) {
        case ViewType.Deposit:
          return getRedbankDepositMsgOptions(amount, denom)
        case ViewType.Withdraw:
          return getRedbankWithdrawMsgOptions(amount, denom)
        case ViewType.Repay:
          return getRedbankRepayMsgOptions(
            amount,
            denom,
            Number(findByDenom(userBalances, denom)?.amount) || 0,
            isMax,
          )
        case ViewType.Borrow:
          return getRedbankBorrowMsgOptions(amount, denom)
        default:
          return undefined
      }
    }, [activeView, amount, redBankContractAddress, denom, isMax, userBalances])

    const { data: fee, error: feeError } = useEstimateFee({
      msg: txMsgOptions?.msg,
      funds:
        activeView === ViewType.Deposit || activeView === ViewType.Repay
          ? [{ denom, amount: amount > 0 ? amount.toFixed(0) : '1' }]
          : undefined,
      contract: redBankContractAddress,
    })

    const produceActionButtonSpec = (): ModalActionButton => {
      return {
        disabled: amount === 0 || capHit,
        fetching: (amount > 0 && typeof fee === 'undefined') || submitted,
        text: t(`redbank.${activeView.toLowerCase()}`),
        clickHandler: handleAction,
        color: 'primary',
      }
    }

    const handleAction = async () => {
      if (!redBankContractAddress || !client) {
        alert('Uh oh, operation failed')
        return
      }

      setSubmitted(true)

      if (!fee || !txMsgOptions) {
        return
      }

      try {
        const res = await executeMsg({
          msg: txMsgOptions.msg,
          // @ts-ignore
          funds: txMsgOptions.funds || [],
          contract: redBankContractAddress,
          fee: fee,
        })

        if (res?.response.code !== 0) {
          setError(res?.rawLogs)
        } else {
          setResponse(res)
        }
      } catch (error) {
        const e = error as { message: string }
        setError(e.message as string)
      }
    }

    const reset = () => {
      setAmount(0)
      setSubmitted(false)
      setError(undefined)
      setIsMax(false)
    }

    const handleClose = () => {
      reset()

      // path on redbank action will always be /redbank/deposit/<denom> etce
      router.push(`/${router.pathname.split('/')[1]}`)
    }

    const removeZeroBalanceValues = (
      assets: RedBankAsset[],
      key: 'borrowBalance' | 'depositBalance',
    ) => {
      const finalisedArray: RedBankAsset[] = []
      for (let i = 0; i < assets.length; i++) {
        if ((assets[i][key] || 0) > 0) {
          finalisedArray.push(assets[i])
        }
      }

      return finalisedArray
    }

    const { depositAssets, borrowAssets } = redBankAssets.reduce(
      (
        prev: {
          depositAssets: RedBankAsset[]
          borrowAssets: RedBankAsset[]
        },
        curr,
      ) => {
        if (Number(curr.depositBalance) > 0) {
          prev.depositAssets.push(curr)
        }
        if (Number(curr.borrowBalance) > 0) {
          prev.borrowAssets.push(curr)
        }
        return prev
      },
      { depositAssets: [], borrowAssets: [] },
    )

    return (
      <div className={styles.cardContainer}>
        <Notification
          content={t('redbank.noFundsForRepay', {
            symbol: borrowAssetName?.symbol || '',
          })}
          showNotification={
            walletBallance === 0 && activeView === ViewType.Repay && !response && !error
          }
          type={NotificationType.Warning}
        />

        {response || submitted || error ? (
          <TxResponse
            error={error}
            handleClose={handleClose}
            onSuccess={() => {
              queryClient.invalidateQueries([QUERY_KEYS.USER_DEPOSIT])
              queryClient.invalidateQueries([QUERY_KEYS.REDBANK])
              queryClient.invalidateQueries([QUERY_KEYS.USER_BALANCE])
              queryClient.invalidateQueries([QUERY_KEYS.USER_DEBT])
            }}
            response={response}
            title={t('common.summaryOfTheTransaction')}
            actions={[
              {
                label: activeView,
                values: [`${lookup(amount, denom, decimals).toString()} ${symbol}`],
              },
            ]}
          />
        ) : (
          <Action
            actionButtonSpec={produceActionButtonSpec()}
            feeError={!fee ? (feeError as string) : undefined}
            activeView={activeView}
            amount={Number(amount)}
            borrowAssets={removeZeroBalanceValues(borrowAssets, 'borrowBalance')}
            decimals={decimals}
            denom={denom}
            depositAssets={removeZeroBalanceValues(depositAssets, 'depositBalance')}
            handleClose={handleClose}
            ltvScaledDepositAmount={totalScaledDepositbaseCurrencyBalance}
            mmScaledDepositAmount={totalMMScaledDepositbaseCurrencyBalance}
            redBankAssets={redBankAssets}
            setAmountCallback={setAmount}
            setIsMax={setIsMax}
            submitted={submitted}
            totalBorrowBaseCurrencyAmount={totalBorrowBaseCurrencyAmount}
            setCapHit={setCapHit}
          />
        )}
      </div>
    )
  },
  (prev, next) => isEqual(prev, next),
)

RedbankAction.displayName = 'RedbankAction'
