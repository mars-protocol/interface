import { Coin } from '@terra-money/terra.js'
import { ReactNode, useEffect, useMemo, useState, useRef } from 'react'
import { useExchangeRate } from '../../../../hooks'
import {
    formatCooldown,
    formatValue,
    lookup,
    lookupSymbol,
    parseNumberInput,
} from '../../../../libs/parse'
import InputSlider from './InputSlider'
import styles from './InputSection.module.scss'
import TxFee from '../../../../components/TxFee'
import { plus } from '../../../../libs/math'
import { useTranslation } from 'react-i18next'
import { useStaking } from '../../../../hooks/useStaking'
import { ViewType } from '../../../../types/enums'
import {
    MARS_DECIMALS,
    MARS_DENOM,
    UST_DECIMALS,
    UST_DENOM,
    XMARS_DECIMALS,
    XMARS_DENOM,
} from '../../../../constants/appConstants'
import CurrencyInput from 'react-currency-input-field'
import useStore from '../../../../store'
import { DocURL } from '../../../../types/enums/DocURL.enum'

interface Props {
    inputCallback: (value: number) => void
    availableText: string
    amount: number
    maxUsableAmount: number
    setAmountCallback: (value: number) => void
    actionButton: ReactNode
    gasFeeFormatted: string
    taxFormatted: string
    onEnterHandler: () => void
    maxButtonClickHandler?: () => void
    denom: string
    decimals: number
    showWarning?: boolean
    checkForMaxValue?: boolean
    activeView?: ViewType
}

const InputSection = ({
    inputCallback,
    availableText,
    amount,
    maxUsableAmount,
    setAmountCallback,
    actionButton,
    gasFeeFormatted,
    taxFormatted,
    onEnterHandler,
    denom,
    decimals,
    showWarning = false,
    checkForMaxValue = false,
    activeView = ViewType.None,
}: Props) => {
    const { t } = useTranslation()
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const inputRef = useRef<HTMLInputElement>(null)
    const { exchangeToUusd } = useExchangeRate()
    const { xMarsRatio: unsafeXmarsRatio, config } = useStaking()

    // --------------------
    // States
    // --------------------
    // used to prevent update feedback look for slider.
    const [cachedSliderValue, setCachedSliderValue] = useState(0)
    const [lastUpdate, setLastUpdate] = useState(0)
    const [sliderValue, setSliderValue] = useState(0)
    const [depositWarning, setDepositWarning] = useState(false)
    const [fakeAmount, setFakeAmount] = useState<string | undefined>()

    // --------------------
    // calculate
    // --------------------
    const xMarsRatio = unsafeXmarsRatio === 0 ? 1 : unsafeXmarsRatio
    const calculateDollarInputAmount = (
        denomToConvert: string = denom,
        amountToConvert: number = amount
    ) =>
        formatValue(
            lookup(
                exchangeToUusd(new Coin(denomToConvert, amountToConvert)),
                UST_DENOM,
                UST_DECIMALS
            ),
            2,
            2,
            true,
            '$',
            false
        )
    const sliderEnabled = useMemo(() => maxUsableAmount > 0, [maxUsableAmount])
    const txFee = useMemo(
        () => Number(plus(gasFeeFormatted, taxFormatted)),
        [gasFeeFormatted, taxFormatted]
    )
    const cooldownTime =
        config?.cooldown_duration && formatCooldown(config.cooldown_duration)

    // If within 50ms of our last update for the slider, return the cached value.
    // This prevents a 'flicker' of the display label when we finish dragging while hovering
    const sliderDisplayValue = useMemo(() => {
        const UPDATE_BUFFER = 50
        const timestamp = new Date().getTime()
        if (timestamp > lastUpdate + UPDATE_BUFFER) {
            const amountToSet = (amount / maxUsableAmount) * 100
            setCachedSliderValue(
                amountToSet >= 100 ? amountToSet + Math.random() : amountToSet
            )
            setLastUpdate(timestamp)
        }
        return cachedSliderValue
    }, [cachedSliderValue, lastUpdate, amount, maxUsableAmount])

    // --------------------
    // Callbacks
    // --------------------

    const onSliderDragged = useMemo(
        () => (value: number) => {
            const currentDate = new Date()
            const timestamp = currentDate.getTime()
            setLastUpdate(timestamp)
            setAmountCallback(maxUsableAmount * value)
            if (checkForMaxValue) {
                setSliderValue(value)
            }
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [setAmountCallback, maxUsableAmount]
    )

    useEffect(() => {
        if (inputRef?.current) inputRef.current.focus()
    }, [])

    useEffect(
        () => {
            if (
                amount >= maxUsableAmount &&
                denom === 'uusd' &&
                !depositWarning &&
                checkForMaxValue
            ) {
                setDepositWarning(true)
            } else {
                setDepositWarning(false)
            }
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [sliderValue, amount, maxUsableAmount]
    )

    // -------------
    // Presentation
    // -------------

    const produceUpperInputInfo = () => {
        if (activeView !== ViewType.Unstake && activeView !== ViewType.Stake) {
            return (
                <span className={`overline ${styles.available}`}>
                    {availableText}
                </span>
            )
        }

        let leftPrefix = ''
        let leftValue = ''
        let rightPrefix = ''
        let rightValue = ''

        if (activeView === ViewType.Unstake) {
            leftPrefix = 'STAKED: '
            leftValue = formatValue(
                lookup(maxUsableAmount, XMARS_DENOM, XMARS_DECIMALS),
                0,
                4,
                false,
                '',
                ' xMARS'
            )
            rightPrefix = '1 xMARS ='
            rightValue = formatValue(xMarsRatio, 0, 4, false, '', ' MARS')
        } else {
            leftPrefix = 'IN WALLET:'
            leftValue = formatValue(
                lookup(maxUsableAmount, MARS_DENOM, MARS_DECIMALS),
                0,
                4,
                false,
                '',
                ' MARS'
            )
            rightPrefix = '1 MARS ='
            rightValue = formatValue(1 / xMarsRatio, 0, 4, false, '', ' xMARS')
        }

        return (
            <div className={styles.unstakeUpperInputInfo}>
                <span className={`overline ${styles.info}`}>
                    <span className={styles.block}>{leftPrefix}</span>
                    <span className={styles.block}>{leftValue}</span>
                </span>
                <div className={styles.spacer}></div>
                <span
                    className={`overline ${styles.info} ${styles.xMarsRatio}`}
                >
                    <span className={styles.block}>{rightPrefix}</span>
                    <span className={styles.block}>{rightValue}</span>
                </span>
            </div>
        )
    }

    const suffix = lookupSymbol(denom, whitelistedAssets || []) || denom

    const produceLowerInputInfo = () => {
        if (activeView === ViewType.Stake) {
            return `${formatValue(
                lookup(amount, MARS_DENOM, MARS_DECIMALS) / xMarsRatio,
                0,
                4,
                false,
                '',
                ' xMARS'
            )} (${calculateDollarInputAmount()})`
        } else if (activeView === ViewType.Unstake) {
            const marsAmount = amount * xMarsRatio
            return `${formatValue(
                lookup(marsAmount, MARS_DENOM, MARS_DECIMALS),
                0,
                4,
                false,
                '',
                ' MARS'
            )} (${calculateDollarInputAmount(MARS_DENOM, marsAmount)})`
        } else {
            return calculateDollarInputAmount()
        }
    }

    return (
        <div>
            {/* INPUT SECTION */}
            <div className={styles.container}>
                {produceUpperInputInfo()}
                {showWarning && (
                    <span className={`overline ${styles.warning}`}>
                        {t('council.marsStakingWarning')}
                    </span>
                )}

                <div className={styles.inputWrapper}>
                    <CurrencyInput
                        className={`h4 ${styles.inputPercentage}`}
                        name='currencyInput'
                        placeholder='0'
                        value={
                            fakeAmount
                                ? fakeAmount
                                : amount
                                ? formatValue(
                                      lookup(amount, denom, decimals),
                                      0,
                                      denom === 'uusd' ? 2 : decimals,
                                      false,
                                      false,
                                      false
                                  )
                                : ''
                        }
                        decimalsLimit={denom === 'uusd' ? 2 : decimals}
                        allowNegativeValue={false}
                        disableAbbreviations={true}
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                onEnterHandler()
                            }
                        }}
                        onValueChange={(value) => {
                            if (value?.charAt(value.length - 1) !== '.') {
                                inputCallback(parseNumberInput(value))
                                setFakeAmount(undefined)
                            } else {
                                setFakeAmount(value)
                            }
                        }}
                        suffix={` ${suffix}`}
                        decimalSeparator='.'
                        groupSeparator=','
                        autoFocus={true}
                    />
                </div>
                <span className={`overline ${styles.inputRaw}`}>
                    {produceLowerInputInfo()}
                </span>
                <div className={styles.inputContainer}>
                    <button
                        onClick={() => setAmountCallback(0)}
                        className={`${styles.sliderButton} ${styles.zero}`}
                    >
                        0
                    </button>
                    <div className={styles.input}>
                        <InputSlider
                            value={sliderDisplayValue}
                            updateCallback={onSliderDragged}
                            enabled={sliderEnabled}
                        />
                        {depositWarning && (
                            <div className={styles.inputWarning}>
                                <p className='tippyContainer'>
                                    {t('common.lowUstAmountAfterTransaction')}
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setAmountCallback(maxUsableAmount)}
                        className={`caption ${styles.sliderButton}`}
                    >
                        {t('global.max')}
                    </button>
                </div>
                <div className={styles.actionButton}>{actionButton}</div>
            </div>
            <TxFee txFee={formatValue(txFee)} />

            {activeView === ViewType.Unstake ? (
                <div className={styles.reminder}>
                    <span className={`overline ${styles.content}`}>
                        {t('council.unstakeReminder', { time: cooldownTime }) +
                            ' '}
                        <a
                            className={styles.link}
                            href={DocURL.STAKING_XMARS}
                            target='_blank'
                            rel='noreferrer'
                        >
                            {t('common.learnMore')}
                        </a>
                    </span>
                </div>
            ) : null}
        </div>
    )
}

export default InputSection
