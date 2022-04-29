import { useTranslation } from 'react-i18next'
import { useRedBank } from '../../../../../../hooks'
import { formatValue, lookup } from '../../../../../../libs/parse'
import { hasError } from '../../../../../../libs/validate'
import { FieldsErrors } from '../../../../../../types/interfaces/errors'
import styles from './Borrow.module.scss'
import { assetData } from './InputSection'

interface BorrowProps {
    errors: FieldsErrors
    secondaryAsset: assetData
    borrowAmount: number
    isFarm: boolean
    differenceText: string
    dollarValueText: string
}

const Borrow = ({
    errors,
    secondaryAsset,
    borrowAmount,
    isFarm,
    differenceText,
    dollarValueText,
}: BorrowProps) => {
    const { t } = useTranslation()

    const { findMarketInfo } = useRedBank()

    const getBorrowRate = () => {
        const rate = findMarketInfo(secondaryAsset.denom)?.borrow_rate
        return rate ? formatValue(rate * 100, 2, 2, true, false, '%') : '-'
    }

    const getColorClass = (): string => {
        return differenceText.indexOf('+') > -1
            ? styles.red
            : differenceText.indexOf('-') > -1
            ? styles.primary
            : styles.hide
    }

    return (
        <div className={`${styles.container} body2`}>
            <span className={styles.head}>{t('fields.iBorrowAsset')}</span>
            <div className={styles.values}>
                <div>
                    {borrowAmount > 0
                        ? formatValue(
                              lookup(
                                  borrowAmount,
                                  secondaryAsset.denom,
                                  secondaryAsset.decimals
                              ),
                              0,
                              2,
                              true,
                              false,
                              ` ${secondaryAsset.symbol}`
                          )
                        : 0}
                </div>
                <div className={styles.dollarValue}>{dollarValueText}</div>
            </div>
            {!isFarm && <div className={getColorClass()}>{differenceText}</div>}

            <div className={styles.spacer}></div>
            {hasError(errors) ? (
                <p className={styles.error}>
                    {errors.uncollateralisedLoanLimit.hasError
                        ? errors.uncollateralisedLoanLimit.label
                        : errors.redbankNoLiquidity.label}
                </p>
            ) : (
                <span className={styles.interest}>
                    <span>{t('fields.payableInterest')}</span>
                    <span>{getBorrowRate()}</span>
                </span>
            )}
        </div>
    )
}

export default Borrow
