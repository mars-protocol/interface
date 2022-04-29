import { convertAprToApy } from '../../../libs/parse'

export const calculateStrategyRate = (
    leverage: number,
    poolApr: number,
    borrowApr: number,
    totalValue: number,
    debtValue: number,
    numberOfCompoundingPeriods: number
) => {
    const annualPoolYield = poolApr * totalValue // Amount earned over 1 year, without compounding
    const annualDebtCost = borrowApr * debtValue // Cost to borrow over course of 1 year, without compounding

    const yearlyIncome = annualPoolYield - annualDebtCost // Yield, accounting for debt, without compounding

    const trueApr = yearlyIncome / totalValue
    const trueApy =
        convertAprToApy(trueApr * 100, numberOfCompoundingPeriods) * leverage
    return trueApy
}
