import styles from './InputSlider.module.scss'
import Slider from '@material-ui/core/Slider'
import { withStyles } from '@material-ui/core/styles'
import throttle from 'lodash.throttle'
import React from 'react'
import { useTranslation } from 'react-i18next'
import colors from '../../../../styles/_assets.module.scss'

interface Props {
    updateCallback: (value: number) => void
    value: number
    enabled: boolean
    sliderColor?: string
    sliderScale?: string
    errorLabel?: string
    minValue?: number
    maxValue?: number
    customMark?: number
    lastUpdate?: number
    showError?: boolean
    disabled?: boolean
}

interface Marks {
    value: number
    label?: string
}

const InputSlider = React.memo(
    ({
        value,
        updateCallback,
        enabled,
        sliderColor = colors.primary,
        sliderScale = 'percentage',
        minValue = 0,
        maxValue = 100,
        customMark = 0,
        disabled = false,
    }: Props) => {
        const { t } = useTranslation()
        // ------------------
        // Callbacks
        // ------------------
        const inputUpdate = (val: number) => {
            if (val > 100) val = 100
            if (val < 0) val = 0
            updateCallback(val / 100)
        }

        const throttledUpdate = throttle(inputUpdate, 100, { trailing: true })

        // ----------------------
        // Presentation
        // ----------------------
        const marksArray =
            minValue === 0 && maxValue === 100
                ? [customMark, 0, 25, 50, 75, 100]
                : [customMark, minValue, maxValue, 0, 25, 50, 75, 100]
        const marksPushed: any[] = []
        const marks: Marks[] = []
        for (let i = 0; i < marksArray.length; i++) {
            if (marksArray[i] === customMark && customMark !== 0) {
                const currentMark = {
                    value: customMark,
                    label: t('fields.current'),
                }
                if (
                    customMark > 7 &&
                    customMark < 80 &&
                    !marksPushed.includes(marksArray[i])
                ) {
                    marks.push(currentMark)
                    marksPushed.push(marksArray[i])
                }
            } else if (marksArray[i] === minValue && minValue !== 0) {
                const minMark = {
                    value: minValue,
                    label: t('global.min_lower'),
                }
                if (
                    minValue > 5 &&
                    minValue < 95 &&
                    Math.abs(customMark - minValue) > 8 &&
                    !marksPushed.includes(marksArray[i])
                ) {
                    marks.push(minMark)
                    marksPushed.push(marksArray[i])
                }
            } else if (marksArray[i] === maxValue && maxValue !== 100) {
                const maxMark = {
                    value: maxValue,
                    label: t('global.max_lower'),
                }
                if (
                    maxValue > 11 &&
                    maxValue < 86 &&
                    Math.abs(customMark - maxValue) > 8 &&
                    !marksPushed.includes(marksArray[i])
                ) {
                    marks.push(maxMark)
                    marksPushed.push(marksArray[i])
                }
            } else {
                const markObject = { value: marksArray[i] }
                if (!marksPushed.includes(marksArray[i])) {
                    marks.push(markObject)
                    marksPushed.push(marksArray[i])
                }
            }
        }
        const MarsSlider = withStyles({
            root: {
                color: sliderColor,
                height: 8,
            },
            thumb: {
                height: 24,
                width: 24,
                backgroundColor: colors.white,
                marginTop: -12,
                marginLeft: -13,
                boxShadow:
                    '0px 3px 4px rgba(0, 0, 0, 0.14), 0px 3px 3px rgba(0, 0, 0, 0.12), 0px 1px 8px rgba(0, 0, 0, 0.2)',
                '&:hover, &$active': {
                    boxShadow: `${sliderColor} 0 2px 3px 1px`,
                    display: 'flex',
                },
                '& .bar': {
                    height: 9,
                    width: 1,
                    backgroundColor: sliderColor,
                    marginLeft: 1,
                    marginRight: 1,
                },
            },
            disabled: {
                color: sliderColor,
                '& .MuiSlider-thumb': {
                    height: 24,
                    width: 24,
                    marginTop: -12,
                    marginLeft: -13,
                    backgroundColor: colors.greyLight,
                },
                '& .MuiSlider-track': {
                    color: sliderColor,
                    opacity: 0.2,
                },
            },
            active: {},
            track: {
                height: 4,
                borderRadius: 6,
                opacity: 1.0,
                boxShadow: `0px 0px 6px ${sliderColor}`,
            },
            rail: {
                height: 4,
                borderRadius: 6,
                background: 'rgba(191,191,191,0.18)',
                opacity: 1,
            },
            mark: {
                backgroundColor: colors.greyLight,
                color: colors.white,
                height: 8,
                width: 8,
                marginLeft: -4,
                marginTop: 12,
                borderRadius: 4,
                opacity: 0.6,
            },
            markLabel: {
                color: colors.greyMedium,
            },
            markActive: {
                opacity: 1,
                backgroundColor: 'sliderColor',
            },
        })(Slider)

        const thumbComponent = React.memo((props: any) => {
            return (
                <span {...props}>
                    <span className='bar' key={0} />
                    <span className='bar' key={1} />
                </span>
            )
        })

        const valueLabelComponent = (props: any) => {
            const { children, open, value } = props
            const offset =
                sliderScale === 'percentage'
                    ? value
                    : `${(Number(value.slice(0, -1)) - 1) * 100}%`

            return (
                <div className={styles.labelComponentContainer}>
                    {children}
                    {open ? (
                        <div
                            className={styles.labelComponent}
                            style={{
                                left: offset,
                            }}
                        >
                            <span className={styles.valueLabel}>{value}</span>
                        </div>
                    ) : null}
                </div>
            )
        }

        const valueLabel = (x: any) => {
            const value = Math.ceil(x) || 0
            if (sliderScale === 'percentage') {
                return `${value}%`
            } else {
                const scale = 1 + value / 100
                return `${scale.toFixed(2)}x`
            }
        }

        return (
            <div className={styles.container}>
                {enabled ? (
                    <div>
                        <MarsSlider
                            ThumbComponent={thumbComponent}
                            ValueLabelComponent={valueLabelComponent}
                            valueLabelDisplay={'auto'}
                            valueLabelFormat={valueLabel}
                            defaultValue={value}
                            step={1}
                            disabled={disabled}
                            marks={marks}
                            // onChange={(e, val) => throttledUpdate(Number(val))}
                            onChangeCommitted={(e, val) =>
                                throttledUpdate(Number(val))
                            }
                        />
                    </div>
                ) : (
                    <MarsSlider disabled={true} marks={marks} />
                )}
            </div>
        )
    }
)

export default InputSlider
