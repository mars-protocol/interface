import Header from '../../../../layouts/txmodal/Header'
import Card from '../../../../components/card/Card'
import InputSection from './components/input-section/InputSection'
import { useEffect, useMemo, useState } from 'react'
import {
    formatValue,
    lookup,
    lookupSymbol,
    formatGasFee,
    formatTax,
} from '../../../../libs/parse'
import {
    useAccountBalance,
    useContract,
    useExchangeRate,
} from '../../../../hooks'
import { Coin, MsgExecuteContract, Fee } from '@terra-money/terra.js'
import Breakdown from './components/Breakdown'
import { plus } from '../../../../libs/math'
import styles from './Strategy.module.scss'
import TxFee from '../../../../components/TxFee'
import Button from '../../../../components/Button'
import colors from '../../../../styles/_assets.module.scss'
import { CircularProgress } from '@material-ui/core'
import TxResponse from '../../../../layouts/txmodal/TxResponse'
import { useFields } from '../../../../hooks/useFields'
import ConnectButton from '../../../../components/header/ConnectButton'
import { TxResult, UserDenied } from '@terra-money/wallet-provider'
import { Trans, useTranslation } from 'react-i18next'
import { NotificationType, ViewType } from '../../../../types/enums'
import { useHistory, useParams } from 'react-router'
import { PostError } from '../../../../layouts/txmodal/TxResultContent'
import { useStrategyMessagesController } from './hooks/useStrategyMessages'
import { useAssetGrid } from '../../../../hooks/useAssetGrid'
import { hasError } from '../../../../libs/validate'
import {
    UST_DECIMALS,
    UST_DENOM,
    VOLATILITY_THRESHOLD,
} from '../../../../constants/appConstants'
import { FieldsErrors } from '../../../../types/interfaces/errors'
import Notification from '../../../../components/Notification'
import useStore from '../../../../store'
import { DocURL } from '../../../../types/enums/DocURL.enum'

export enum InputType {
    Supply = 'Supply',
    Borrow = 'Borrow',
}

export interface ModalActionButton {
    text: String
    disabled: boolean
    clickHandler: () => void
    color: string
}

const Strategy = () => {
    const { t } = useTranslation()
    const { find } = useAccountBalance()
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    // const { queryErrors } = useErrors()
    const { estimateFee } = useContract()
    const { exchangeToUusd } = useExchangeRate()
    const { refetch, strategies } = useFields()
    const { borrowMarketsGridData } = useAssetGrid()
    const history = useHistory()
    const userWalletAddress = useStore((s) => s.userWalletAddress)

    // --------------------
    // States
    // --------------------
    const [fee, setFee] = useState<StdFee>()
    const [feeError, setFeeError] = useState(false)

    const [fetchingFee, setFetchingFee] = useState(false)
    const [fetchTimeout, setFetchTimeout] = useState<any>(null)
    const [submitted, setSubmitted] = useState(false)
    const [response, setResponse] = useState<TxResult>()
    const [error, setError] = useState<any>()
    const [isClosingPosition, setIsClosingPosition] = useState(false)
    const { post } = useContract()
    const getTax = useStore((s) => s.getTax)
    const [isClosing, setIsClosing] = useState(false)

    const [txMessage, setTxMessage] = useState<MsgExecuteContract[] | []>([])

    const [primaryPrice, setPrimaryPrice] = useState(0)
    const [secondaryPrice, setSecondaryPrice] = useState(1)
    // const isEstimateFeeError = queryErrors.includes('estimateFee')
    const isEstimateFeeError = false

    //@ts-ignore
    const { key } = useParams()

    const strategy = strategies?.find((strategy) => strategy.key === key)
    const poolPrimaryAssetPrice =
        Number(strategy?.secondarySupplyRatio || 1) /
        Number(strategy?.primarySupplyRatio || 1)
    const [inputErrors, setInputErrors] = useState<FieldsErrors>({
        redbankNoLiquidity: {
            hasError: false,
            label: t('error.errorRedbankNoLiquidity'),
        },
        uncollateralisedLoanLimit: {
            hasError: false,
            label: t('error.errorLoanLimitExhausted', {
                secondarySymbol: strategy?.assets[1].symbol,
            }),
        },
    })

    const activeView =
        Number(strategy?.position?.bond_units || 0) > 0
            ? ViewType.Manage
            : ViewType.Farm

    const primaryDepth =
        strategy?.pool_info?.assets[strategy.primaryAssetIndex].amount
    const secondaryDepth =
        strategy?.pool_info?.assets[strategy.primaryAssetIndex === 0 ? 1 : 0]
            .amount
    const totalShares = Number(strategy?.pool_info?.total_share)

    const usersBondedShares = Math.floor(
        (Number(strategy?.bondedShares) *
            Number(strategy?.position?.bond_units)) /
            Number(strategy?.total_bond_units)
    )

    // units bonded in our position

    const primaryUnitsBonded = Math.floor(
        (Number(primaryDepth) * usersBondedShares) / totalShares
    )

    const secondaryUnitsBonded: number = Math.floor(
        (Number(secondaryDepth) * usersBondedShares) / totalShares
    )

    // values, not units
    const debtValue = Number(strategy?.health?.debt_value)

    // secondary - debt. This needs to refelct our ,
    // because we are calculating off of value not units.
    // todo use debt units to calculate units
    const secondarySupplyAmount =
        secondaryUnitsBonded - debtValue < 0
            ? 0
            : secondaryUnitsBonded - debtValue // works fine while our ust oracle is fixed to 1 exactly

    const secondaryInitialBorrowAmount = debtValue
        ? Number(debtValue) / secondaryPrice
        : 0
    const strategyMessageController = useStrategyMessagesController(
        strategy,
        primaryUnitsBonded,
        secondaryUnitsBonded,
        debtValue
    )

    // strategy.assets comes from config not astro
    const primaryAsset: any = strategy
        ? strategy.assets[0]
        : { denom: 'uusd', decimals: 6 }

    const supplyAssetBalance = find(primaryAsset?.denom)

    primaryAsset.wallet = Number(supplyAssetBalance?.amount) || 0

    const secondaryAsset: any = strategy
        ? strategy.assets[1]
        : { denom: 'uusd', decimals: 6 }

    const borrowAssetBalance = find(secondaryAsset?.denom)
    secondaryAsset.wallet = Number(borrowAssetBalance?.amount) || 0

    const [amounts, setAmounts] = useState<StrategyAmounts>({
        primary: primaryUnitsBonded,
        secondary: secondarySupplyAmount,
        debt: debtValue,
    })

    const isFarm = activeView === ViewType.Farm
    const pnl = Number(strategy?.position?.pnl)

    const tax = getTax(amounts.secondary.toFixed(0))

    const showVolatilityNotification = useMemo(
        () => {
            const poolPrice = primaryPrice
            const oraclePrice = exchangeToUusd(
                new Coin(primaryAsset?.denom || '', 1 || '0')
            )
            return Math.abs(poolPrice / oraclePrice - 1) > VOLATILITY_THRESHOLD
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [primaryPrice]
    )

    const produceAvailableText = (type: string) => {
        let value
        if (type === InputType.Supply) {
            value = formatValue(
                lookup(
                    primaryAsset.wallet,
                    primaryAsset.denom,
                    primaryAsset.decimals
                ),
                0,
                4,
                true,
                false,
                ` ${lookupSymbol(primaryAsset.denom, whitelistedAssets || [])}`
            )
        } else {
            value = formatValue(
                lookup(
                    secondaryAsset.wallet,
                    secondaryAsset.denom,
                    secondaryAsset.decimals
                ),
                2,
                2,
                true,
                false,
                ` ${lookupSymbol(
                    secondaryAsset.denom,
                    whitelistedAssets || []
                )}`
            )
        }
        return t('common.inWalletAmount', { amount: value })
    }

    // -----------------------------
    // Transaction objects
    // -----------------------------
    const taxFormatted = useMemo(
        () => formatTax(whitelistedAssets, tax, primaryAsset.denom),
        [whitelistedAssets, tax, primaryAsset.denom]
    )
    const gasFeeFormatted = useMemo(
        () => formatGasFee(whitelistedAssets, fee?.amount.toString()),
        [fee, whitelistedAssets]
    )

    const txFee = useMemo(
        () => plus(gasFeeFormatted, taxFormatted),
        [gasFeeFormatted, taxFormatted]
    )

    const fetchFee = async () => {
        // txMessage is empty here, but at some point it should fill

        if (
            strategy &&
            userWalletAddress &&
            txMessage?.length &&
            !submitted &&
            !feeError
        ) {
            const msgs = txMessage
            try {
                const fee = estimateFee({ msgs })
                setFee(await fee)
                setFetchingFee(false)
            } catch {
                setFetchingFee(false)
                setFeeError(true)
            }
        }
    }

    useEffect(
        () => {
            setPrimaryPrice(
                Number(strategy?.secondarySupplyRatio || 1) /
                    Number(strategy?.primarySupplyRatio || 1)
            )

            setSecondaryPrice(
                secondaryAsset?.denom === 'uusd'
                    ? 1
                    : exchangeToUusd(
                          new Coin(secondaryAsset?.denom || '', 1 || '0')
                      )
            )
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [strategy?.secondarySupplyRatio, strategy?.primarySupplyRatio]
    )

    useEffect(
        () => {
            if (isFarm && amounts.secondary === 0 && amounts.primary === 0) {
                // get fee
                // set fee
                setFetchingFee(false)
                setFee(undefined)
            }
            clearTimeout(fetchTimeout)
            setFetchTimeout(setTimeout(() => fetchFee(), 500))

            setIsClosingPosition(
                amounts.primary === 0 && amounts.secondary === 0 && !isFarm
            )

            return () => {
                clearTimeout(fetchTimeout)
            }
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [strategy, amounts, userWalletAddress, txMessage]
    )

    useEffect(
        () => {
            const updateMessage = async () => {
                setTxMessage(
                    isFarm
                        ? strategyMessageController.farmMessage(amounts)
                        : await strategyMessageController.manageMessage(amounts)
                )
            }

            updateMessage()
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [strategy, userWalletAddress, amounts, activeView]
    )

    // -------------
    // Presentation
    // -------------
    const getBorrowLiquidity = () => {
        return +borrowMarketsGridData.find(
            (asset) => asset?.denom === secondaryAsset?.denom
        )!.liquidity!
    }

    const handleAction = async () => {
        if (!strategy) {
            alert(t('error.errorNoStratgy'))
            return
        }

        setSubmitted(true)
        if (!fee || !txMessage) {
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

    const produceTabActionButton = () => {
        return (
            <Button
                id='actionButton'
                disabled={
                    !fee ||
                    fetchingFee ||
                    fee.amount === 0 ||
                    hasError(inputErrors) ||
                    feeError
                }
                showProgressIndicator={submitted || fetchingFee}
                text={
                    !fee && !fetchingFee
                        ? t('fields.waiting')
                        : isEstimateFeeError
                        ? t('error.errorEstimatedFee')
                        : isFarm
                        ? t('fields.farm')
                        : isClosingPosition
                        ? t('common.close')
                        : t('common.confirm')
                }
                onClick={() => handleAction()}
                color='primary'
            />
        )
    }

    const actionButton = userWalletAddress ? (
        produceTabActionButton()
    ) : (
        <ConnectButton color={'secondary'} />
    )

    const closePositionButton = () => {
        return (
            <Button
                key='close-button'
                text={t('fields.closePosition')}
                color='secondary'
                onClick={handleClosePosition}
            />
        )
    }

    const supplyBackground = colors.primaryAlpha
    const borrowBackground = colors.secondaryAlpha
    const breakdownBackground = colors.backgroundInTile

    const reset = () => {
        setFee(undefined)
        setSubmitted(false)
        setResponse(undefined)
        setError(undefined)
        setFeeError(false)
    }

    const handleClose = () => {
        reset()
        refetch()
        history.push('/fields')
    }

    const handleClosePosition = () => {
        setAmounts({ primary: 0, secondary: 0, debt: amounts.debt })
        setIsClosing(true)
        const actionBtnTop = document.getElementById('actionButton')?.offsetTop

        if (actionBtnTop) {
            window.scrollTo({
                top: actionBtnTop + 200 - window.innerHeight,
                behavior: 'smooth',
            })
        }
    }

    return strategy ? (
        <div>
            {response || error ? (
                <div className={styles.responseWrapper}>
                    <Card>
                        <TxResponse
                            error={error}
                            response={response}
                            denom={secondaryAsset.denom}
                            decimals={secondaryAsset.decimals}
                            amount={'0'}
                            supplyAmount={amounts.primary}
                            borrowAmount={amounts.secondary}
                            assets={strategy?.assets}
                            txFee={txFee}
                            handleClose={handleClose}
                            label={activeView}
                            refetchQueries={[refetch]}
                        />
                    </Card>
                </div>
            ) : (
                <>
                    <Notification
                        showNotification={showVolatilityNotification}
                        content={t('fields.volatilityNotification')}
                        type={NotificationType.Warning}
                        hideCloseBtn={true}
                    />
                    <Card>
                        <div>
                            <Header
                                src={'back'}
                                handleClose={handleClose}
                                buttons={!isFarm ? [closePositionButton()] : []}
                                titleText={`${activeView}: ${primaryAsset.symbol}-${secondaryAsset.symbol}`}
                                tooltip={
                                    <p>
                                        <Trans
                                            id=''
                                            values={{
                                                secondaryAsset: secondaryAsset,
                                            }}
                                        >
                                            Supply an asset and borrow{' '}
                                            {secondaryAsset.symbol} from the Red
                                            Bank to leverage your position.
                                            <a
                                                href={DocURL.FIELDS}
                                                rel='noreferrer'
                                                target='_blank'
                                                className={styles.link}
                                            >
                                                {' '}
                                                Learn more.
                                            </a>
                                        </Trans>
                                    </p>
                                }
                            />
                            <InputSection
                                activeView={activeView}
                                primaryAvailableText={produceAvailableText(
                                    InputType.Supply
                                )}
                                primaryInitialAmount={primaryUnitsBonded}
                                primaryAsset={primaryAsset}
                                primaryPrice={poolPrimaryAssetPrice}
                                primaryBackgroundColor={supplyBackground}
                                primaryColor={colors.primary}
                                primaryTitle={t('fields.myAssetSupply', {
                                    assetSymbol: primaryAsset.symbol,
                                })}
                                primaryTtCopy={t(
                                    'fields.fieldsPrimaryAssetTooltip',
                                    {
                                        secondaryAsset:
                                            strategy.assets[1].symbol,
                                    }
                                )}
                                primaryHint={t(
                                    'fields.primaryAssetNeedsToBeSupplied'
                                )}
                                secondaryAvailableText={produceAvailableText(
                                    InputType.Borrow
                                )}
                                secondaryInitialAmount={secondarySupplyAmount}
                                secondaryAsset={secondaryAsset}
                                secondaryPrice={secondaryPrice}
                                secondaryBackgroundColor={borrowBackground}
                                secondaryColor={colors.secondary}
                                secondaryTitle={t('fields.myAssetSupply', {
                                    assetSymbol: secondaryAsset.symbol,
                                })}
                                secondaryTtCopy={t(
                                    'fields.fieldsSecondaryAssetTooltip',
                                    {
                                        secondaryAsset: secondaryAsset.symbol,
                                    }
                                )}
                                secondaryRedbankLiquidity={getBorrowLiquidity()}
                                secondaryInitialBorrowAmount={debtValue}
                                setAmountCallback={setAmounts}
                                onEnterHandler={handleAction}
                                setInputErrorsCallback={setInputErrors}
                                uncollaterisedLoanLimit={
                                    strategy.uncollaterisedLoanLimit
                                }
                                strategyTotalDebtValue={Number(
                                    strategy.strategyTotalDebt
                                )}
                                errors={inputErrors}
                                isClosing={isClosing}
                                setIsClosingCallback={setIsClosing}
                                disabled={showVolatilityNotification}
                            />
                            <Breakdown
                                apy={strategy?.position?.trueApy || 0}
                                amounts={amounts}
                                activeView={activeView}
                                backgroundColor={breakdownBackground}
                                title={t('fields.breakdown')}
                                ttCopy={t('fields.fieldsBreakdownTooltip')}
                                primaryAsset={primaryAsset}
                                primaryPrice={primaryPrice}
                                secondaryAsset={secondaryAsset}
                                secondaryPrice={secondaryPrice}
                                primaryInitialAmount={primaryUnitsBonded}
                                secondaryInitialSupplyAmount={
                                    secondarySupplyAmount
                                }
                                secondaryInitialBorrowAmount={
                                    secondaryInitialBorrowAmount
                                }
                                maxLtv={Number(strategy.max_ltv)}
                                position={strategy?.position}
                                lastUpdate={Number(strategy.snapshot.time)}
                            />
                            {isEstimateFeeError && (
                                <div
                                    className={`overline ${styles.estimateFeeErrorWrapper}`}
                                >
                                    <div className={styles.estimateFeeError}>
                                        <div
                                            className={
                                                styles.estimateFeeErrorCopy
                                            }
                                        >
                                            <Trans i18nKey='error.fieldsEstimateFeeError' />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className={styles.buttonRow}>
                                <div className={styles.buttonWrapper}>
                                    <div className={styles.actionButton}>
                                        {actionButton}
                                    </div>
                                </div>
                                <span>
                                    <TxFee txFee={fetchingFee ? '0' : txFee} />
                                </span>
                            </div>
                            {!isFarm ? (
                                <div className={styles.pnlDisclaimerWrapper}>
                                    <div
                                        className={`overline ${styles.pnlDisclaimer}`}
                                    >
                                        <Trans
                                            i18nKey='fields.positionHasAccruedAnEstimated'
                                            values={{
                                                pnl: formatValue(
                                                    lookup(
                                                        pnl,
                                                        UST_DENOM,
                                                        UST_DECIMALS
                                                    )
                                                ),
                                                pnlString:
                                                    pnl >= 0
                                                        ? t('fields.profit')
                                                        : t('fields.loss'),
                                            }}
                                        >
                                            <p
                                                className={
                                                    styles.disclaimerCopy
                                                }
                                            />
                                            <p
                                                className={
                                                    pnl > 0
                                                        ? styles.primary
                                                        : styles.red
                                                }
                                            />
                                            <p
                                                className={
                                                    styles.disclaimerCopy
                                                }
                                            />
                                        </Trans>
                                    </div>
                                </div>
                            ) : undefined}
                        </div>
                    </Card>
                </>
            )}
        </div>
    ) : (
        <div>
            <Card>
                <div
                    style={{
                        height: '1085px',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <CircularProgress color='inherit' size={'3rem'} />
                </div>
            </Card>
        </div>
    )
}

export default Strategy
