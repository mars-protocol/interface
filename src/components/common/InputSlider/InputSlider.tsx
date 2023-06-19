import Slider from '@material-ui/core/Slider'
import { withStyles } from '@material-ui/core/styles'
import BigNumber from 'bignumber.js'
import { getLeverageRatio } from 'functions/fields'
import { formatValue, roundToDecimals } from 'libs/parse'
import throttle from 'lodash.throttle'
import { useTranslation } from 'react-i18next'
import colors from 'styles/_assets.module.scss'

import styles from './InputSlider.module.scss'

interface Props {
  value: number
  enabled: boolean
  sliderColor?: string
  isLeverage?: boolean
  errorLabel?: string
  minValue?: number
  maxValue?: number
  customMark?: number
  lastUpdate?: number
  showError?: boolean
  disabled?: boolean
  leverageLimit?: number
  leverageMax?: number
  onChange: (value: number) => void
}

interface Marks {
  value: number
  label?: string
}

export const InputSlider = ({
  value,
  onChange,
  enabled,
  sliderColor = colors.primary,
  isLeverage = false,
  minValue = 0,
  maxValue = 100,
  customMark = 0,
  disabled = false,
  leverageMax = 2,
  leverageLimit = leverageMax,
}: Props) => {
  const leveragePerPercent = (maxValue - 1) / 100
  const { t } = useTranslation()
  // ---------------------
  // Callbacks
  // ---------------------
  const inputUpdate = (percentage: number) => {
    if (percentage > 100) percentage = 100
    if (percentage < 0) percentage = 0
    if (isLeverage) {
      const maxAllowedPercentage = getLeverageRatio(leverageLimit, maxValue)
      if (percentage > maxAllowedPercentage) percentage = maxAllowedPercentage
      onChange(percentage * leveragePerPercent + 1)
    } else {
      onChange(percentage)
    }
  }

  const throttledUpdate = throttle(inputUpdate, 100, { trailing: true })

  // -------------------------
  // Presentation
  // -------------------------

  const leverageRatio = getLeverageRatio(leverageMax, maxValue)
  const marksArray =
    minValue === 0 && maxValue === 100
      ? [customMark, 0, 25, 50, 75, 100]
      : [
          0,
          0.25 * leverageRatio,
          0.5 * leverageRatio,
          0.75 * leverageRatio,
          leverageRatio,
          ...(100 - leverageRatio >= 2 ? [100] : []),
        ]
  const marksPushed: any[] = []
  const marks: Marks[] = []
  for (let i = 0; i < marksArray.length; i++) {
    if (marksArray[i] === customMark && customMark !== 0) {
      const currentMark = {
        value: customMark,
        label: t('fields.current'),
      }
      if (customMark > 7 && customMark < 80 && !marksPushed.includes(marksArray[i])) {
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
      const labelText = formatValue(
        ((maxValue - 1) * marksArray[i]) / 100 + 1,
        2,
        2,
        false,
        false,
        'x',
      )
      // Labels only for the 1st, 3rd, 5th mark. In case of overleverage, display the 6th mark when 10% space is available
      const label = isLeverage
        ? [0, 2, 4].includes(i) || (i === 5 && marksArray[4] / marksArray[5] < 0.9)
          ? labelText
          : ''
        : ''

      const markObject = {
        value: marksArray[i],
        label,
      }
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
      opacity: 0.6,
    },
    markActive: {
      opacity: 1,
      backgroundColor: 'sliderColor',
    },
  })(Slider)

  const thumbComponent = (props: any) => {
    return (
      <span {...props}>
        <span key={0} className='bar' />
        <span key={1} className='bar' />
      </span>
    )
  }

  const valueLabelComponent = (props: any) => {
    const { children, open, value } = props
    const currentLeverage = Number(value.replace('x', ''))
    const offset = !isLeverage ? value : `${((currentLeverage - 1) / (maxValue - 1)) * 100 + 2}%`

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
    const ceiled = Math.ceil(x) || 0
    if (!isLeverage) {
      return `${ceiled}%`
    } else {
      const s = roundToDecimals(new BigNumber(x).times(leveragePerPercent).plus(1).toNumber(), 2)
      return `${s.toFixed(2)}x`
    }
  }

  const percentage = getLeverageRatio(leverageLimit, maxValue) || 0

  return (
    <div className={styles.container}>
      {isLeverage && leverageLimit < leverageMax && (
        <div className={styles.leverageLimit}>
          <div className={styles.line} style={{ left: `calc(${percentage}% - 1px)` }}></div>
          <div className={styles.outside} style={{ left: `calc(${percentage}% + 1px)` }}></div>
        </div>
      )}
      <div className={styles.slider}>
        {enabled ? (
          <MarsSlider
            ThumbComponent={thumbComponent}
            ValueLabelComponent={valueLabelComponent}
            defaultValue={getLeverageRatio(value, maxValue)}
            disabled={disabled}
            step={0.5}
            valueLabelDisplay={'auto'}
            valueLabelFormat={valueLabel}
            marks={marks}
            onChangeCommitted={(e, percentage) => throttledUpdate(Math.round(Number(percentage)))}
          />
        ) : (
          <MarsSlider disabled={true} marks={marks} />
        )}
      </div>
    </div>
  )
}
