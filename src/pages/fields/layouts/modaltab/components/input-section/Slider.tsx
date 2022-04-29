import styles from './Slider.module.scss'
import InputSlider from '../../../../../../layouts/txmodal/tab/components/InputSlider'
import { Button as MaterialButton } from '@material-ui/core'
import { formatValue, lookup } from '../../../../../../libs/parse'
import { assetData } from './InputSection'

interface SliderProps {
    sliderPercentage: number
    sliderEnabled: boolean
    color: string
    asset: assetData
    maxAmount: number
    borrowLimit?: number | null
    disabled?: boolean
    maxButtonHandler: () => void
    onSliderUpdate: (value: number) => void
}

const Slider = ({
    sliderPercentage,
    sliderEnabled,
    color,
    asset,
    maxAmount,
    borrowLimit,
    disabled = false,
    maxButtonHandler,
    onSliderUpdate,
}: SliderProps) => {
    const getMaxValue = () => {
        return borrowLimit
            ? borrowLimit > maxAmount && maxAmount > 0
                ? maxAmount
                : borrowLimit
            : maxAmount
    }
    return (
        <div className={styles.inputContainer}>
            <span className={styles.zero}>0</span>
            <div className={styles.input}>
                <InputSlider
                    value={sliderPercentage}
                    updateCallback={onSliderUpdate}
                    enabled={sliderEnabled}
                    sliderColor={color}
                    customMark={sliderPercentage}
                    disabled={disabled}
                />
            </div>
            <MaterialButton
                className={`caption ${styles.maxButton}`}
                onClick={() => {
                    maxButtonHandler()
                }}
                disabled={!sliderEnabled || disabled}
                disableRipple={true}
            >
                {formatValue(
                    lookup(getMaxValue(), asset.denom, asset.decimals),
                    0,
                    2,
                    true,
                    false,
                    true
                )}{' '}
                {asset.symbol}
            </MaterialButton>
        </div>
    )
}

export default Slider
