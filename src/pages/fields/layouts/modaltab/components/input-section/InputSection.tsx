import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    formatValue,
    lookup,
    magnify,
    toAmount,
} from '../../../../../../libs/parse'
import styles from './InputSection.module.scss'
import { addDecimals } from '../../../../../../libs/math'
import Tooltip from '../../../../../../components/tooltip/Tooltip'
import { AssetType, ViewType } from '../../../../../../types/enums'
import {
    UST_DECIMALS,
    UST_DENOM,
} from '../../../../../../constants/appConstants'
import Borrow from './Borrow'
import InputField from './InputField'
import Slider from './Slider'
import { FieldsErrors } from '../../../../../../types/interfaces/errors'

export interface assetData {
    denom: string
    name: string
    symbol: string
    wallet: number
    decimals: number
}

interface Props {
    activeView: string
    primaryAvailableText: string
    primaryInitialAmount: number
    primaryAsset: assetData
    primaryPrice: number
    primaryBackgroundColor: string
    primaryColor: string
    primaryTitle?: string
    primaryTtCopy: string
    primaryHint: string
    secondaryAvailableText: string
    secondaryInitialAmount: number
    secondaryAsset: assetData
    secondaryPrice: number
    secondaryBackgroundColor: string
    secondaryColor: string
    secondaryTitle: string
    secondaryTtCopy: string
    secondaryRedbankLiquidity: number
    secondaryInitialBorrowAmount: number
    uncollaterisedLoanLimit: number
    strategyTotalDebtValue: number
    errors: FieldsErrors
    isClosing: boolean
    disabled?: boolean
    setIsClosingCallback: Dispatch<SetStateAction<boolean>>
    setAmountCallback: (amounts: StrategyAmounts) => void
    onEnterHandler: () => void
    setInputErrorsCallback: (errors: FieldsErrors) => void
}

const InputSection = React.memo(
    ({
        activeView,
        primaryAvailableText,
        primaryInitialAmount,
        primaryAsset,
        primaryPrice,
        primaryBackgroundColor,
        primaryColor,
        primaryTitle,
        primaryTtCopy,
        primaryHint,
        secondaryAvailableText,
        secondaryInitialAmount,
        secondaryAsset,
        secondaryPrice,
        secondaryBackgroundColor,
        secondaryColor,
        secondaryTitle,
        secondaryTtCopy,
        secondaryRedbankLiquidity,
        secondaryInitialBorrowAmount,
        uncollaterisedLoanLimit,
        strategyTotalDebtValue,
        errors,
        isClosing,
        disabled = false,
        setIsClosingCallback,
        setAmountCallback,
        onEnterHandler,
        setInputErrorsCallback,
    }: Props) => {
        // --------------------
        // Status
        // --------------------
        const isManage = activeView === ViewType.Manage
        const isFarm = activeView === ViewType.Farm

        // --------------------
        // States
        // --------------------
        const [primaryWalletValue, setPrimaryWalletValue] = useState(
            primaryAsset.wallet * primaryPrice
        )

        const [primaryInitialValue, setPrimaryInitialValue] = useState(
            primaryInitialAmount * primaryPrice
        )

        const [primaryMaxAmount, setPrimaryMax] = useState(
            primaryAsset.wallet + primaryInitialAmount
        )

        const [primaryMaxValue, setPrimaryMaxValue] = useState(
            primaryMaxAmount * primaryPrice
        )

        const [
            primaryInitialSliderPercentage,
            setPrimaryInitialSliderPercentage,
        ] = useState(
            isManage ? (primaryInitialValue / primaryMaxValue) * 100 : 0
        )

        // --------------------
        // calculate borrow
        // --------------------
        const buffer: number = Number(magnify(2, UST_DECIMALS))
        const [primaryAmount, setPrimaryAmount] = useState(primaryInitialAmount)
        const [secondaryAmount, setSecondaryAmount] = useState(
            secondaryInitialAmount
        )
        const [borrowAmount, setBorrowAmount] = useState(
            secondaryInitialBorrowAmount
        )
        const [borrowLimit, setBorrowLimit] = useState(
            primaryInitialValue / secondaryPrice
        )

        const isChanged =
            primaryAmount !== primaryInitialAmount ||
            secondaryAmount !== secondaryInitialAmount

        const [primaryInput, setPrimaryInput] = useState<string>(
            primaryInitialAmount > 0
                ? addDecimals(
                      lookup(
                          primaryInitialAmount,
                          primaryAsset.denom,
                          primaryAsset.decimals
                      )
                  )
                : '0'
        )

        const [secondaryInput, setSecondaryInput] = useState<string>(
            Number(secondaryInitialAmount) > 0
                ? addDecimals(
                      lookup(
                          secondaryInitialAmount,
                          secondaryAsset.denom,
                          secondaryAsset.decimals
                      )
                  )
                : '0'
        )

        const primaryValue =
            Number(magnify(Number(primaryInput), primaryAsset.decimals)) *
            primaryPrice

        const secondaryMax =
            Number(primaryInput) > 0
                ? Math.min(
                      secondaryAsset.wallet + secondaryInitialAmount - buffer,
                      primaryValue
                  )
                : 0

        const secondaryInitialSliderPercentage = Math.round(
            (secondaryInitialAmount / secondaryMax) * 100
        )

        // Slider values
        const [primaryShowInputTooltip, setPrimaryShowInputTooltip] =
            useState(false)

        const [secondaryShowInputTooltip, setSecondaryShowInputTooltip] =
            useState(false)

        const [primarySliderPercentage, setPrimarySliderPercentage] = useState(
            primaryInitialSliderPercentage
        )
        const [secondarySliderPercentage, setSecondarySliderPercentage] =
            useState(secondaryInitialSliderPercentage)

        // hooks
        const [initialLoad, setInitialLoad] = useState(true)

        const setSecondaryAmountSafely = (value: number) => {
            setSecondaryAmount(value > 0 ? value : 0)
        }
        useEffect(
            () => {
                if (initialLoad && isFarm) {
                    setPrimaryInput('0')
                    setPrimaryAmount(0)
                    setPrimarySliderPercentage(0)
                    setSecondaryInput('0')
                    setSecondaryAmountSafely(0)
                    setSecondarySliderPercentage(0)
                    setBorrowAmount(0)
                }
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [initialLoad, isFarm]
        )

        useEffect(() => {
            if (isClosing) {
                manualInput('0', AssetType.Primary)
                setIsClosingCallback(false)
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isClosing])

        useEffect(
            () => {
                setPrimaryWalletValue(primaryAsset.wallet * primaryPrice)
                setPrimaryInitialValue(primaryInitialAmount * primaryPrice)
                setPrimaryMax(primaryAsset.wallet + primaryInitialAmount)
                setPrimaryMaxValue(primaryMaxAmount * primaryPrice)
                setPrimaryInitialSliderPercentage(
                    isManage ? (primaryInitialValue / primaryMaxValue) * 100 : 0
                )
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [primaryPrice, secondaryPrice]
        )

        const calculateDollarValue = (type: AssetType) => {
            let value: number

            switch (type) {
                case AssetType.Primary:
                    value = primaryAmount * primaryPrice
                    break
                case AssetType.Secondary:
                    value = secondaryAmount * secondaryPrice
                    break
                default:
                    value = borrowAmount * secondaryPrice
            }

            return formatValue(
                lookup(value, UST_DENOM, UST_DECIMALS),
                0,
                2,
                true,
                '$',
                true
            )
        }

        const calculateInputDifference = (type: AssetType) => {
            let valueDiff: number
            const numberOfDecimals =
                type === AssetType.Primary
                    ? primaryAsset.decimals
                    : secondaryAsset.decimals

            switch (type) {
                case AssetType.Primary:
                    valueDiff = Number(
                        lookup(
                            primaryAmount - primaryInitialAmount,
                            primaryAsset.denom,
                            numberOfDecimals
                        )
                    )
                    break
                case AssetType.Secondary:
                    valueDiff = lookup(
                        secondaryAmount - secondaryInitialAmount,
                        secondaryAsset.denom,
                        numberOfDecimals
                    )
                    break
                default:
                    valueDiff = Number(
                        lookup(
                            borrowAmount - secondaryInitialBorrowAmount,
                            secondaryAsset.denom,
                            numberOfDecimals
                        )
                    )
            }

            return formatValue(
                Math.abs(valueDiff),
                0,
                numberOfDecimals,
                true,
                valueDiff === 0 ? '' : valueDiff > 0 ? '+' : '-',
                ''
            )
        }

        const primarySliderEnabled = useMemo(
            () => primaryMaxAmount > 0,
            [primaryMaxAmount]
        )

        const secondarySliderEnabled = useMemo(
            () => primaryAmount > 0,
            [primaryAmount]
        )

        const primaryMaxButtonHandler = () => {
            setPrimaryAmount(primaryMaxAmount)
            setPrimaryInput(
                lookup(
                    primaryMaxAmount,
                    primaryAsset.denom,
                    primaryAsset.decimals
                ).toString()
            )
            setBorrowLimit(primaryMaxValue / secondaryPrice)
            setPrimarySliderPercentage(100)
            setInitialLoad(false)
        }

        const secondaryMaxButtonHandler = () => {
            const amount =
                borrowLimit > secondaryMax ? secondaryMax : borrowLimit
            setSecondaryAmountSafely(amount)
            setSecondaryInput(
                lookup(
                    amount,
                    secondaryAsset.denom,
                    secondaryAsset.decimals
                ).toString()
            )
            setBorrowAmount(
                secondaryMax > borrowLimit ? 0 : borrowLimit - secondaryMax
            )
            setSecondarySliderPercentage(100)
            setInitialLoad(false)
        }

        const manualInput = (input: string, type: AssetType) => {
            let microValue: number
            setInitialLoad(false)
            if (type === AssetType.Primary) {
                microValue = Number(toAmount(input, primaryAsset.decimals))
                setPrimaryInput(input)
                setPrimaryShowInputTooltip(microValue > primaryMaxAmount)
                if (microValue > primaryMaxAmount) {
                    setPrimarySliderPercentage(100)
                    setPrimaryAmount(primaryMaxAmount)
                    setBorrowLimit(primaryWalletValue / secondaryPrice)
                } else {
                    setPrimarySliderPercentage(
                        (microValue / primaryMaxAmount) * 100
                    )
                    setPrimaryAmount(microValue)
                }

                setSecondaryInput(
                    lookup(
                        secondaryAmount,
                        secondaryAsset.denom,
                        secondaryAsset.decimals
                    ).toString()
                )
                setSecondaryShowInputTooltip(false)
            } else {
                microValue = Number(toAmount(input, secondaryAsset.decimals))
                const upperLimit =
                    borrowLimit > secondaryMax ? secondaryMax : borrowLimit
                setSecondaryInput(input)
                let newDebtAmount: number

                if (microValue > upperLimit) {
                    newDebtAmount = borrowLimit - upperLimit
                    setSecondaryAmountSafely(upperLimit)
                    setBorrowAmount(newDebtAmount)
                } else {
                    newDebtAmount = borrowLimit - microValue
                    setSecondaryAmountSafely(microValue)
                    setBorrowAmount(newDebtAmount)
                }

                setSecondaryShowInputTooltip(microValue > secondaryMax)
                setSecondarySliderPercentage((microValue / secondaryMax) * 100)

                setPrimaryInput(
                    lookup(
                        primaryAmount,
                        primaryAsset.denom,
                        primaryAsset.decimals
                    ).toString()
                )
                setPrimaryShowInputTooltip(false)
            }
        }

        // --------------------
        // Callbacks
        // --------------------
        const primaryOnSliderUpdate = useMemo(
            () => (value: number) => {
                const newBorrowLimit = primaryMaxAmount * value * primaryPrice
                setPrimaryAmount(primaryMaxAmount * value)
                setPrimaryInput(
                    lookup(
                        primaryMaxAmount * value,
                        primaryAsset.denom,
                        primaryAsset.decimals
                    ).toString()
                )

                setBorrowLimit(newBorrowLimit)
                setPrimaryShowInputTooltip(false)
                setInitialLoad(false)

                if (borrowAmount === 0) {
                    const borrowAmount =
                        (primaryMaxAmount * value * primaryPrice) /
                        secondaryPrice
                    setBorrowAmount(borrowAmount)
                }
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [primaryPrice]
        )

        const secondaryOnSliderUpdate = useMemo(
            () => (value: number) => {
                let newAmount
                let newBorrowAmount
                const currentBorrowLimit =
                    (primaryAmount * primaryPrice) / secondaryPrice
                const borrowBase = Math.min(
                    secondaryAsset.wallet + secondaryInitialAmount - buffer,
                    currentBorrowLimit
                )

                if (value * 100 < 1) {
                    setBorrowAmount(currentBorrowLimit)
                    setSecondaryAmountSafely(0)
                    setSecondaryInput('0')
                } else {
                    newBorrowAmount = borrowBase * value
                    newAmount = currentBorrowLimit - newBorrowAmount

                    if (secondaryAmount !== newBorrowAmount) {
                        setSecondaryAmountSafely(newBorrowAmount)
                        setSecondaryInput(
                            lookup(
                                newBorrowAmount,
                                secondaryAsset.denom,
                                secondaryAsset.decimals
                            ).toString()
                        )
                        setBorrowAmount(newAmount)
                    }
                }

                setBorrowLimit(currentBorrowLimit)
                setInitialLoad(false)
                setPrimaryShowInputTooltip(false)
                setPrimaryInput(
                    lookup(
                        primaryAmount,
                        primaryAsset.denom,
                        primaryAsset.decimals
                    ).toString()
                )
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [primaryAmount, setInitialLoad, primaryPrice]
        )

        useEffect(
            () => {
                const currentBorrowLimit =
                    (primaryAmount * primaryPrice) / secondaryPrice
                if (borrowLimit !== currentBorrowLimit) {
                    setBorrowLimit(currentBorrowLimit)
                }
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [primaryAmount, primaryPrice]
        )

        useEffect(() => {
            const additionalBorrowAmount =
                borrowAmount - secondaryInitialBorrowAmount
            const strategyDebtTotalAmount =
                (additionalBorrowAmount + strategyTotalDebtValue) /
                secondaryPrice

            if (additionalBorrowAmount > secondaryRedbankLiquidity) {
                errors.redbankNoLiquidity.hasError = true
            } else {
                errors.redbankNoLiquidity.hasError = false
            }

            // UncollateralisedLoanLimit needs to be checked with amount
            if (
                strategyDebtTotalAmount > uncollaterisedLoanLimit &&
                additionalBorrowAmount > 0
            ) {
                errors.uncollateralisedLoanLimit.hasError = true
            } else {
                errors.uncollateralisedLoanLimit.hasError = false
            }

            setInputErrorsCallback({
                ...errors,
            })
            // eslint-disable-next-line
        }, [
            borrowAmount,
            secondaryPrice,
            uncollaterisedLoanLimit,
            strategyTotalDebtValue,
            secondaryRedbankLiquidity,
        ])

        useEffect(
            () => {
                let secondarySliderPercentageNew =
                    secondaryInitialSliderPercentage

                const borrowBase =
                    borrowLimit > secondaryMax ? secondaryMax : borrowLimit

                if (borrowLimit === 0) {
                    setBorrowAmount(0)
                    setSecondaryAmountSafely(0)
                    secondarySliderPercentageNew = 0
                    setSecondaryInput('0')
                } else {
                    if (
                        secondarySliderPercentageNew >= 100 &&
                        secondaryMax > borrowLimit
                    ) {
                        setSecondaryAmountSafely(borrowLimit)
                        setBorrowAmount(0)
                        setSecondaryInput(
                            lookup(
                                borrowLimit,
                                secondaryAsset.denom,
                                secondaryAsset.decimals
                            ).toString()
                        )
                    } else if (secondaryAmount >= borrowBase) {
                        secondarySliderPercentageNew = 100
                        setSecondaryAmountSafely(borrowBase)
                        setBorrowAmount(borrowLimit - borrowBase)
                        setSecondaryInput(
                            lookup(
                                borrowBase,
                                secondaryAsset.denom,
                                secondaryAsset.decimals
                            ).toString()
                        )
                    } else {
                        const borrowAmount = isChanged
                            ? borrowLimit - secondaryAmount
                            : secondaryInitialBorrowAmount
                        setBorrowAmount(borrowAmount)
                        secondarySliderPercentageNew =
                            (secondaryAmount / borrowBase) * 100
                    }
                    if (secondaryShowInputTooltip) {
                        setSecondaryShowInputTooltip(false)
                    }
                }

                if (
                    secondarySliderPercentage !== secondarySliderPercentageNew
                ) {
                    setSecondarySliderPercentage(
                        secondarySliderPercentageNew >= 100
                            ? secondarySliderPercentageNew + Math.random()
                            : Math.ceil(secondarySliderPercentageNew)
                    )
                }
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [borrowLimit, primaryAmount]
        )

        // --------------------
        // Calc and Send
        // --------------------
        useEffect(() => {
            setTimeout(() => {
                setAmountCallback({
                    primary: primaryAmount,
                    secondary: secondaryAmount,
                    debt: borrowAmount,
                })
            }, 100)
            // eslint-disable-next-line
        }, [primaryAmount, secondaryAmount, borrowAmount, borrowLimit])

        return (
            <>
                <div
                    className={styles.container}
                    style={{ background: primaryBackgroundColor }}
                >
                    <div className={styles.tooltip}>
                        <Tooltip content={primaryTtCopy} iconWidth={'18px'} />
                    </div>
                    {primaryTitle && (
                        <p className={styles.title}>{primaryTitle}</p>
                    )}
                    <InputField
                        asset={primaryAsset}
                        assetType={AssetType.Primary}
                        color={primaryColor}
                        availableText={primaryAvailableText}
                        input={primaryInput}
                        amount={primaryAmount}
                        showTooltip={primaryShowInputTooltip}
                        isManage={isManage}
                        differenceText={calculateInputDifference(
                            AssetType.Primary
                        )}
                        calculateDollarValue={calculateDollarValue}
                        onEnterHandler={onEnterHandler}
                        manualInput={manualInput}
                        disabled={disabled}
                    />
                    <Slider
                        sliderPercentage={primarySliderPercentage}
                        sliderEnabled={primarySliderEnabled}
                        color={primaryColor}
                        asset={primaryAsset}
                        maxAmount={primaryMaxAmount}
                        maxButtonHandler={primaryMaxButtonHandler}
                        onSliderUpdate={primaryOnSliderUpdate}
                        disabled={disabled}
                    />

                    <div className={`${styles.hint} body2`}>{primaryHint}</div>
                </div>
                <div
                    className={styles.container}
                    style={{ background: secondaryBackgroundColor }}
                >
                    <div className={styles.tooltip}>
                        <Tooltip content={secondaryTtCopy} iconWidth={'18px'} />
                    </div>

                    {secondaryTitle && (
                        <p className={styles.title}>{secondaryTitle}</p>
                    )}

                    <InputField
                        asset={secondaryAsset}
                        assetType={AssetType.Secondary}
                        color={secondaryColor}
                        input={secondaryInput}
                        amount={secondaryAmount}
                        showTooltip={secondaryShowInputTooltip}
                        availableText={secondaryAvailableText}
                        isManage={isManage}
                        manualInput={manualInput}
                        onEnterHandler={onEnterHandler}
                        differenceText={calculateInputDifference(
                            AssetType.Secondary
                        )}
                        calculateDollarValue={calculateDollarValue}
                        disabled={disabled}
                    />
                    <Slider
                        borrowLimit={borrowLimit}
                        asset={secondaryAsset}
                        sliderEnabled={secondarySliderEnabled}
                        maxAmount={secondaryMax}
                        color={secondaryColor}
                        sliderPercentage={secondarySliderPercentage}
                        onSliderUpdate={secondaryOnSliderUpdate}
                        maxButtonHandler={secondaryMaxButtonHandler}
                        disabled={disabled}
                    />
                    <Borrow
                        errors={errors}
                        secondaryAsset={secondaryAsset}
                        borrowAmount={borrowAmount}
                        isFarm={isFarm}
                        differenceText={calculateInputDifference(
                            AssetType.Borrow
                        )}
                        dollarValueText={calculateDollarValue(AssetType.Borrow)}
                    />
                </div>
            </>
        )
    }
)

export default InputSection
