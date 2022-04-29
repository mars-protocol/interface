import styles from './InputField.module.scss'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatValue, lookup } from '../../../../../../libs/parse'
import { AssetType } from '../../../../../../types/enums'
import { assetData } from './InputSection'
import CurrencyInput from 'react-currency-input-field'

interface InputFieldProps {
    asset: assetData
    assetType: AssetType
    color: string
    availableText: string
    input: string
    amount: number
    showTooltip: boolean
    isManage: boolean
    differenceText: string
    disabled?: boolean
    calculateDollarValue: (type: AssetType) => string
    onEnterHandler: () => void
    manualInput: (input: string, type: AssetType) => void
}

const InputField = ({
    asset,
    assetType,
    color,
    availableText,
    input,
    amount,
    showTooltip,
    isManage,
    differenceText,
    disabled = false,
    calculateDollarValue,
    onEnterHandler,
    manualInput,
}: InputFieldProps) => {
    const { t } = useTranslation()
    const inputRef = useRef<HTMLInputElement>(null)
    const [fakeAmount, setFakeAmount] = useState<string | undefined>()

    useEffect(() => {
        if (inputRef?.current && assetType === AssetType.Primary)
            inputRef.current.select()
    }, [assetType])

    const getColorClass = (): string => {
        return differenceText.indexOf('-') > -1
            ? styles.red
            : differenceText.indexOf('+') > -1
            ? styles.primary
            : styles.hide
    }

    return (
        <div className={styles.container}>
            <span className={`${styles.available} overline`}>
                {availableText}
            </span>
            <div>
                <CurrencyInput
                    ref={inputRef}
                    style={{ borderColor: color }}
                    className={styles.input}
                    name='currencyInput'
                    placeholder='0'
                    value={
                        fakeAmount
                            ? fakeAmount
                            : input
                            ? formatValue(
                                  input,
                                  0,
                                  asset.denom === 'uusd' ? 2 : asset.decimals,
                                  false,
                                  false,
                                  false
                              )
                            : ''
                    }
                    decimalsLimit={asset.denom === 'uusd' ? 2 : asset.decimals}
                    allowNegativeValue={false}
                    disableAbbreviations={true}
                    onKeyPress={(event) => {
                        if (event.key === 'Enter') {
                            onEnterHandler()
                        }
                    }}
                    onValueChange={(value) => {
                        if (value?.charAt(value.length - 1) !== '.') {
                            manualInput(value || '', assetType)
                            setFakeAmount(undefined)
                        } else {
                            setFakeAmount(value)
                        }
                    }}
                    suffix={` ${asset.symbol}`}
                    decimalSeparator='.'
                    groupSeparator=','
                    disabled={disabled}
                />
                {showTooltip && (
                    <div className={styles.tooltip}>
                        {t('fields.inputUpdatedTo', {
                            assetAmount: lookup(
                                amount,
                                asset.denom,
                                asset.decimals
                            ),
                            assetSymbol: asset.symbol,
                        })}
                    </div>
                )}
            </div>
            <div className={`${styles.hint} overline`}>
                {isManage && (
                    <div className={getColorClass()}>{differenceText}</div>
                )}
                <div className={`${styles.transparent} overline`}>
                    {calculateDollarValue(assetType)}
                </div>
            </div>
        </div>
    )
}

export default InputField
