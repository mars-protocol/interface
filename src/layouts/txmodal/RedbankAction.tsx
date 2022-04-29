import Header from './Header'

import { useAccountBalance, useNewContractMsg, useRedBank } from '../../hooks'
import {
    getMaTokenAddress,
    ltvWeightedDepositValue,
    maintainanceMarginWeightedDepositValue,
} from '../../libs/assetInfo'
import styles from './RedbankAction.module.scss'
import { useEffect, useMemo, useRef, useState } from 'react'
import ModalTab from './tab/ModalTab'
import TxResponse from './TxResponse'
import TxFailed from './TxFailed'
import { plus } from '../../libs/math'
import {
    formatGasFee,
    formatTax,
    lookup,
    lookupCw20Contract,
    lookupDecimals,
} from '../../libs/parse'
import { MsgExecuteContract, Fee } from '@terra-money/terra.js'
import Card from '../../components/card/Card'
import { TxResult, UserDenied } from '@terra-money/wallet-provider'
import { PostError } from './TxResultContent'
import { useContract } from '../../hooks/useContract'
import { useAssetGrid } from '../../hooks/useAssetGrid'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { ViewType } from '../../types/enums'
import { useTranslation } from 'react-i18next'
import useStore from '../../store'

export interface ModalActionButton {
    text: String
    disabled: boolean
    clickHandler: () => void
    color: string
}

interface Props {
    activeView: ViewType
}

const RedbankAction = ({ activeView }: Props) => {
    // @ts-ignore
    const { denom } = useParams()
    const { t } = useTranslation()

    const FEE_EST_AMOUNT = '2'
    const OVERPAY_SCALER = 1.001

    const networkAddresses = useStore((s) => s.networkAddresses)
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const { estimateFee } = useContract()
    const cw20ContractAddress = lookupCw20Contract(
        denom,
        whitelistedAssets || []
    )
    const decimals = lookupDecimals(denom, whitelistedAssets || []) || 6
    const isCw20Token = !!cw20ContractAddress
    const newContractMsg = useNewContractMsg()
    const {
        findMarketInfo,
        findUserAssetCollateral,
        refetch: refetchRedBank,
    } = useRedBank()
    const { find, refetch: refetchAccountBalance } = useAccountBalance()
    const {
        supplyMarketsGridData: supplyAssets,
        borrowMarketsGridData: borrowAssets,
    } = useAssetGrid()

    // React router
    const location = useLocation()
    const history = useHistory()

    const [refreshTx, setRefreshTx] = useState(true)
    const [amount, setAmount] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [response, setResponse] = useState<TxResult>()
    const [error, setError] = useState<PostError>()
    const { post } = useContract()
    const [isMax, setIsMax] = useState<boolean>(false)
    const [fee, setFee] = useState<StdFee>()
    const [feeError, setFeeError] = useState(false)
    const getTax = useStore((s) => s.getTax)

    const tax = getTax(isCw20Token ? '0' : amount.toString())

    // Read only states
    const redBankContractAddress =
        networkAddresses?.contracts.redBankContractAddress
    const maTokenAddress = getMaTokenAddress(networkAddresses?.whitelist, denom)

    const totalScaledDepositUusdBalance = ltvWeightedDepositValue(
        supplyAssets,
        findMarketInfo,
        findUserAssetCollateral
    )

    const totalMMScaledDepositUusdBalance =
        maintainanceMarginWeightedDepositValue(
            supplyAssets,
            findMarketInfo,
            findUserAssetCollateral
        )

    const totalBorrowUusdAmount = borrowAssets.reduce(
        (total, asset) => total + (asset.uusdBalance || 0),
        0
    )

    // -----------------------------
    // Transaction objects
    // -----------------------------
    const taxFormatted = useMemo(
        () => formatTax(whitelistedAssets, tax, denom),
        [whitelistedAssets, tax, denom]
    )
    const gasFeeFormatted = useMemo(
        () => formatGasFee(whitelistedAssets, fee?.amount.toString()),
        [fee, whitelistedAssets]
    )
    const txFee = useMemo(
        () => plus(gasFeeFormatted, taxFormatted),
        [gasFeeFormatted, taxFormatted]
    )

    const mountedRef = useRef(true)

    // Withdraw
    const withdrawTxMessage = useMemo(() => {
        const executeMsg: WithdrawTxMessage = isCw20Token
            ? {
                  withdraw: {
                      asset: {
                          cw20: {
                              contract_addr: cw20ContractAddress,
                          },
                      },
                  },
              }
            : {
                  withdraw: {
                      asset: {
                          native: {
                              denom: denom,
                          },
                      },
                  },
              }

        // If we want to withdraw all our amount, the SC accepts sending no amount and will default to withdrawing all available.
        if (!isMax || totalBorrowUusdAmount > 0)
            executeMsg.withdraw.amount =
                amount === 0 ? FEE_EST_AMOUNT : amount.toFixed(0)

        return [newContractMsg(redBankContractAddress || '', executeMsg)]
    }, [
        redBankContractAddress,
        amount,
        denom,
        cw20ContractAddress,
        isCw20Token,
        isMax,
        totalBorrowUusdAmount,
        newContractMsg,
    ])

    // Deposit
    const depositTxMessage = useMemo(() => {
        if (isCw20Token) {
            const executeMsg = {
                send: {
                    contract: redBankContractAddress,
                    amount: amount === 0 ? FEE_EST_AMOUNT : amount.toFixed(0),
                    msg: Buffer.from(
                        JSON.stringify({ deposit_cw20: {} })
                    ).toString('base64'),
                },
            }
            const msgs: MsgExecuteContract[] = [
                newContractMsg(cw20ContractAddress, executeMsg),
            ]
            return msgs
        }

        return [
            newContractMsg(
                redBankContractAddress || '',
                { deposit_native: { denom: denom } },
                {
                    denom,
                    amount: amount === 0 ? FEE_EST_AMOUNT : amount.toFixed(0),
                }
            ),
        ]
    }, [
        redBankContractAddress,
        amount,
        denom,
        cw20ContractAddress,
        isCw20Token,
        newContractMsg,
    ])

    // Repay
    const repayTxMessage = useMemo(() => {
        // For repay, we need to slightly overpay to ensure the debt is cleared. Any excess is refunded to us.
        const accountBalance = Number(find(denom)?.amount) || 0
        let adjustedAmount = Number(amount)

        if (isMax) {
            const overpayAmount = adjustedAmount * OVERPAY_SCALER

            // Can't overpay if user doesn't have the balance in their wallet to overpay
            adjustedAmount =
                overpayAmount > accountBalance ? accountBalance : overpayAmount
        }

        if (isCw20Token) {
            const executeMsg = {
                send: {
                    contract: redBankContractAddress,
                    amount:
                        adjustedAmount === 0
                            ? FEE_EST_AMOUNT
                            : adjustedAmount.toFixed(0),
                    msg: Buffer.from(
                        JSON.stringify({ repay_cw20: {} })
                    ).toString('base64'),
                },
            }
            const msgs: MsgExecuteContract[] = [
                newContractMsg(cw20ContractAddress, executeMsg),
            ]
            return msgs
        }

        const msgs: MsgExecuteContract[] = [
            newContractMsg(
                redBankContractAddress || '',
                { repay_native: { denom: denom } },
                {
                    denom,
                    amount:
                        adjustedAmount === 0
                            ? FEE_EST_AMOUNT
                            : adjustedAmount.toFixed(0),
                }
            ),
        ]

        return msgs
    }, [
        redBankContractAddress,
        amount,
        denom,
        cw20ContractAddress,
        isCw20Token,
        isMax,
        newContractMsg,
        find,
    ])

    // Borrow
    const borrowTxMessage = useMemo(
        () => [
            newContractMsg(
                redBankContractAddress || '',
                isCw20Token
                    ? {
                          borrow: {
                              asset: {
                                  cw20: {
                                      contract_addr: cw20ContractAddress,
                                  },
                              },
                              amount:
                                  amount === 0
                                      ? FEE_EST_AMOUNT
                                      : amount.toFixed(0),
                          },
                      }
                    : {
                          borrow: {
                              asset: {
                                  native: {
                                      denom: denom,
                                  },
                              },
                              amount:
                                  amount === 0
                                      ? FEE_EST_AMOUNT
                                      : amount.toFixed(0),
                          },
                      }
            ),
        ],
        [
            redBankContractAddress,
            amount,
            denom,
            cw20ContractAddress,
            isCw20Token,
            newContractMsg,
        ]
    )

    const txMessage = useMemo(() => {
        return activeView === ViewType.Deposit
            ? depositTxMessage
            : activeView === ViewType.Borrow
            ? borrowTxMessage
            : activeView === ViewType.Repay
            ? repayTxMessage
            : withdrawTxMessage
    }, [
        depositTxMessage,
        borrowTxMessage,
        withdrawTxMessage,
        repayTxMessage,
        activeView,
    ])

    useEffect(() => {
        setRefreshTx(true)

        return () => {
            mountedRef.current = false
            setRefreshTx(false)
        }
    }, [activeView])

    useEffect(() => {
        let isSubscribed = true
        const fetchFee = async () => {
            const msgs = txMessage
            if (refreshTx) {
                setRefreshTx(false)
                if (!redBankContractAddress || !maTokenAddress) {
                    return
                }
                try {
                    const fee = estimateFee({ msgs })
                    setFee(await fee)
                } catch {
                    if (isSubscribed) {
                        setFeeError(true)
                    }
                }
            }
        }

        fetchFee()

        return () => {
            isSubscribed = false
            mountedRef.current = false
        }
    }, [
        activeView,
        estimateFee,
        redBankContractAddress,
        txMessage,
        refreshTx,
        maTokenAddress,
    ])

    const produceActionButtonSpec = (): ModalActionButton => {
        return {
            disabled:
                !Number(amount) || amount === 0 || typeof fee === 'undefined',
            text: activeView,
            clickHandler: handleAction,
            color: 'primary',
        }
    }

    const handleAction = async () => {
        if (!redBankContractAddress || !maTokenAddress) {
            alert('Uh oh, operation failed')
            return
        }

        setSubmitted(true)

        if (!fee) {
            return
        }

        const msgs = txMessage
        try {
            const { gasPrice, amount, gas } = fee

            const txOptions = {
                msgs,
                memo: '',
                gasPrices: `${gasPrice}uusd`,
                fee: new Fee(gas, {
                    uusd: plus(amount, tax),
                }),
                purgeQueue: true,
            }

            const postResponse = await post(txOptions)
            setResponse(postResponse)
        } catch (postError) {
            if (postError instanceof UserDenied) {
                setSubmitted(false)
                setResponse(undefined)
                setError(undefined)
            } else {
                setError(postError as PostError)
            }
        }
    }

    const reset = () => {
        setAmount(0)
        setFeeError(false)
        setSubmitted(false)
        setResponse(undefined)
        setError(undefined)
        setIsMax(false)
    }

    const handleClose = () => {
        reset()

        // path on redbank action will always be /redbank/deposit/<denom> etc
        history.push(`/${location.pathname.split('/')[1]}`)
    }

    const removeZeroBalanceValues = (assets: AssetInfo[]) => {
        const finalisedArray: AssetInfo[] = []
        for (var i = 0; i < assets.length; i++) {
            if ((assets[i].uusdBalance || 0) > 0) {
                finalisedArray.push(assets[i])
            }
        }

        return finalisedArray
    }

    const getTooltip = (): string | undefined => {
        switch (activeView) {
            case ViewType.Borrow:
                return t('redbank.redbankActionBorrowTooltip')
            case ViewType.Deposit:
                return t('redbank.redbankActionDepositTooltip')
            case ViewType.Withdraw:
                return t('redbank.redbankActionWithdrawTooltip')
            case ViewType.Repay:
                return t('redbank.redbankActionRepayTooltip')
        }
    }

    return (
        <div className={styles.cardContainer}>
            <Card>
                <div className={styles.container}>
                    {feeError ? (
                        <TxFailed
                            message={'Oops... something bad happened.'}
                            handleClose={handleClose}
                        />
                    ) : response || error ? (
                        <TxResponse
                            error={error}
                            response={response}
                            denom={denom}
                            decimals={decimals}
                            amount={lookup(amount, denom, decimals).toString()}
                            txFee={txFee}
                            handleClose={handleClose}
                            label={activeView}
                            refetchQueries={[
                                refetchRedBank,
                                refetchAccountBalance,
                            ]}
                        />
                    ) : (
                        <div>
                            <Header
                                src={'back'}
                                handleClose={handleClose}
                                titleText={activeView}
                                tooltip={getTooltip()}
                            />
                            <ModalTab
                                amount={Number(amount)}
                                borrowAssetData={removeZeroBalanceValues(
                                    borrowAssets
                                )}
                                supplyAssetData={removeZeroBalanceValues(
                                    supplyAssets
                                )}
                                setAmountCallback={setAmount}
                                setIsMax={setIsMax}
                                mmScaledDepositAmount={
                                    totalMMScaledDepositUusdBalance
                                }
                                ltvScaledDepositAmount={
                                    totalScaledDepositUusdBalance
                                }
                                totalBorrowUusdAmount={totalBorrowUusdAmount}
                                actionButtonSpec={produceActionButtonSpec()}
                                submitted={submitted}
                                gasFeeFormatted={gasFeeFormatted}
                                taxFormatted={taxFormatted}
                                activeView={activeView}
                                denom={denom}
                                decimals={decimals}
                            />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default RedbankAction
