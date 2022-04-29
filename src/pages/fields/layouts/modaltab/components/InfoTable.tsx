import styles from './InfoTable.module.scss'
import BorrowLimit from '../../../../../components/borrowlimit/BorrowLimit'
import { assetData } from './input-section/InputSection'
import { formatValue } from '../../../../../libs/parse'
import { useTranslation } from 'react-i18next'
import { ViewType } from '../../../../../types/enums'
import Table from './Table'

interface Props {
    apy: number
    primaryAmount: number
    primaryInitialAmount?: number
    primaryAsset: assetData
    primaryPrice: number
    secondarySupplyAmount: number
    secondaryBorrowAmount: number
    secondaryInPool: number
    secondaryInitialSupplyAmount?: number
    secondaryInitialBorrowAmount?: number
    secondaryAsset: assetData
    secondaryPrice: number
    liqThreshold: number
    borrowRate: number
    activeView: string
    closePosition?: boolean
}

const InfoTable = ({
    apy,
    primaryAmount,
    primaryInitialAmount = 0,
    primaryAsset,
    primaryPrice,
    secondarySupplyAmount,
    secondaryBorrowAmount,
    secondaryInPool,
    secondaryInitialSupplyAmount = 0,
    secondaryInitialBorrowAmount = 0,
    secondaryAsset,
    secondaryPrice,
    liqThreshold,
    borrowRate,
    activeView,
    closePosition = false,
}: Props) => {
    const { t } = useTranslation()

    // calculate value of bonded position (according to oracle price + pool depth.
    // This simulates the contract health check)
    const secondarySupplyValue = secondarySupplyAmount * secondaryPrice || 0
    const secondaryBorrowValue = secondaryBorrowAmount * secondaryPrice || 0
    const primaryValue = primaryAmount * primaryPrice || 0
    const supplyChange = Number(
        (primaryAmount - primaryInitialAmount).toFixed(0)
    )
    const borrowChange = Number(
        (secondarySupplyAmount - secondaryInitialSupplyAmount).toFixed(0)
    )
    const initialPrimaryValue = primaryInitialAmount * primaryPrice
    const initialSecondarySupplyValue =
        secondaryInitialSupplyAmount * secondaryPrice
    const initialSecondaryBorrowValue =
        secondaryInitialBorrowAmount * secondaryPrice
    const debtChange = Number(
        (secondaryBorrowAmount - secondaryInitialBorrowAmount).toFixed(0)
    )
    const positionBorrowChange = debtChange + borrowChange

    // NOTE: Difficult to get a reliable secondary value at this point,
    // because this component serves both the before and after screens.
    // It's easier to easy and safe to use primaryValue * 2
    // The downside of doing this means that the position value can vary
    // ever so slightly from what is the true size (e.g 0.005% difference)
    const positionValue = primaryValue + primaryValue
    const ltv = secondaryBorrowValue / positionValue || 0
    const liquidationPrice = primaryPrice * Math.pow(ltv / liqThreshold, 2)

    const leverage =
        1 + secondaryBorrowValue / (positionValue - secondaryBorrowValue) || 1

    const trueApy = apy * leverage
    // const trueApy = calculateStrategyRate(
    //     leverage,
    //     apr / 100,
    //     borrowRate,
    //     positionValue,
    //     secondaryBorrowValue,
    //     365
    // )

    const outStandingDebt =
        initialSecondaryBorrowValue -
        initialPrimaryValue +
        initialSecondarySupplyValue

    const getAmountsToReceive = (): {
        primaryAmount: number
        secondaryAmount: number
    } => {
        let primaryToReceive = primaryInitialAmount
        let secondaryToReceive = secondaryInitialSupplyAmount

        if (outStandingDebt > 0) {
            const repayWithSecondary =
                outStandingDebt > secondaryInitialSupplyAmount
                    ? secondaryInitialSupplyAmount
                    : outStandingDebt

            secondaryToReceive =
                secondaryInitialSupplyAmount - repayWithSecondary

            const leftOverValue = outStandingDebt - secondaryToReceive

            if (secondaryToReceive === 0) {
                primaryToReceive =
                    primaryInitialAmount - leftOverValue / primaryPrice
            }
        }

        return {
            primaryAmount: primaryToReceive,
            secondaryAmount: secondaryToReceive,
        }
    }

    return (
        <div
            className={
                closePosition
                    ? `${styles.container} ${styles.close}`
                    : styles.container
            }
        >
            {!closePosition && (
                <>
                    <div className={styles.overview}>
                        <div className={styles.row}>
                            <div className={styles.cell}>
                                {t('fields.myApy')}:{' '}
                                <span className={styles.data}>
                                    {formatValue(
                                        trueApy,
                                        2,
                                        2,
                                        true,
                                        false,
                                        '%'
                                    )}
                                </span>
                            </div>
                            <div className={styles.cell}>
                                {t('fields.leverage')}:{' '}
                                <span className={styles.data}>
                                    {formatValue(
                                        leverage,
                                        2,
                                        2,
                                        true,
                                        false,
                                        'x',
                                        true
                                    )}
                                </span>
                            </div>
                            <div className={styles.cell}>
                                {t('fields.liqPrice')}:{' '}
                                <span className={styles.data}>
                                    {formatValue(
                                        liquidationPrice,
                                        2,
                                        liquidationPrice < 0.01 ? 3 : 2,
                                        true,
                                        `${primaryAsset.symbol} < $`,
                                        false
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.ltv}>
                        <BorrowLimit
                            width={'460px'}
                            ltv={ltv * 100}
                            maxLtv={liqThreshold * 100}
                            criticalIndicator={50 / liqThreshold}
                            liquidationThreshold={liqThreshold * 100}
                            barHeight={'24px'}
                            showPercentageText={true}
                            showTitleText={true}
                            showLegend={true}
                            top={5}
                            title={t('common.ltv')}
                            percentageThreshold={15}
                            percentageOffset={50}
                            mode={'percental'}
                        />
                    </div>
                </>
            )}
            {!closePosition ? (
                // INITIAL / AFTER UPDATE TABLE
                <Table
                    header={t('fields.myPosition')}
                    primaryAsset={primaryAsset}
                    secondaryAsset={secondaryAsset}
                    isFarm={activeView === ViewType.Farm}
                    rows={[
                        {
                            title: t('fields.supply'),
                            primaryAmount: primaryAmount,
                            secondaryAmount: secondarySupplyAmount,
                            primaryChange: supplyChange,
                            secondaryChange: borrowChange,
                            primaryValue: primaryValue,
                            secondaryValue: secondarySupplyValue,
                        },
                        {
                            title: t('common.borrowed'),
                            secondaryAmount: secondaryBorrowAmount,
                            secondaryChange: debtChange,
                            secondaryValue: secondaryBorrowValue,
                            isBorrow: true,
                        },
                        {
                            title: t('fields.outstandingDebt'),
                            secondaryAmount: outStandingDebt,
                            secondaryValue: outStandingDebt,
                        },
                        {
                            title: t('fields.positionValue'),
                            primaryAmount: primaryAmount,
                            secondaryAmount:
                                secondarySupplyAmount +
                                secondaryBorrowAmount -
                                outStandingDebt,
                            primaryChange: supplyChange,
                            secondaryChange: positionBorrowChange,
                            primaryValue: positionValue,
                        },
                    ]}
                />
            ) : (
                // CLOSING POSITION TABLE
                <Table
                    header={t('fields.settlement')}
                    primaryAsset={primaryAsset}
                    secondaryAsset={secondaryAsset}
                    rows={[
                        {
                            title: t('fields.supply'),
                            primaryAmount: primaryInitialAmount,
                            secondaryAmount: secondaryInitialSupplyAmount,
                            primaryValue: initialPrimaryValue,
                            secondaryValue: initialSecondarySupplyValue,
                        },
                        {
                            title: t('common.borrowed'),
                            secondaryAmount: secondaryInitialBorrowAmount,
                            secondaryValue: initialSecondaryBorrowValue,
                        },
                        {
                            title: t('fields.outstandingDebt'),
                            secondaryAmount: outStandingDebt,
                            secondaryValue: outStandingDebt,
                        },
                        {
                            title: t('fields.youWillReceive'),
                            ...getAmountsToReceive(),
                            primaryValue:
                                initialPrimaryValue +
                                initialSecondarySupplyValue -
                                outStandingDebt,
                        },
                    ]}
                />
            )}
        </div>
    )
}

export default InfoTable
