import { Coin, MsgExecuteContract } from '@terra-money/terra.js'
import createContext from '../../../../../hooks/createContext'
import { useSimulateSwap } from '../../../../../hooks/useSimulateSwap'
import { useFields } from '../../../../../hooks/useFields'
import {
    bond,
    borrow,
    Borrow,
    Deposit,
    deposit,
    repay,
    swap,
    unbond,
    useIncreaseAllowance,
    useUpdatePosition,
} from '../../../../../hooks/useStrategies'
import BigNumber from 'bignumber.js'

interface SwapAndRepay {
    swapAmount: number
    repay: number
}
interface StrategyMessages {
    farmMessage: (amounts: StrategyAmounts) => MsgExecuteContract[]
    manageMessage: (amounts: StrategyAmounts) => Promise<MsgExecuteContract[]>
}
export const [useStrategyMessages, StrategyMessagesProvider] =
    createContext<StrategyMessages>('useCooldown')

export const useStrategyMessagesController = (
    strategy: StrategyObject | undefined,
    primarySupplyAmount: number,
    secondarySupplyAmount: number,
    initialDebtAmount: number
): StrategyMessages => {
    const SLIPPAGE_FACTOR = 0.99
    const increaseAllowance = useIncreaseAllowance()
    const updatePosition = useUpdatePosition()
    const { calculateSwapAmount, simulate } = useSimulateSwap()
    const { calculateUnlock } = useFields()

    // adjust for debt
    const availableSecondary =
        secondarySupplyAmount - initialDebtAmount > 0
            ? secondarySupplyAmount - initialDebtAmount
            : 0

    // get assets from strategy. Default to uusd if
    const primaryAsset: any = strategy?.assets[0]
    const secondaryAsset: any = strategy?.assets[1]

    const poolPrice =
        Number(strategy?.secondarySupplyRatio || 1) /
        Number(strategy?.primarySupplyRatio || 1)

    const buildCoinArray = (amounts: StrategyAmounts) => {
        const nativeAssets: Coin[] = []

        // build native assets
        if (primaryAsset.native && amounts.primary > 0)
            nativeAssets.push(
                new Coin(primaryAsset.denom, amounts.primary.toFixed(0))
            )

        if (amounts.secondary > 0 && secondaryAsset.native)
            nativeAssets.push(
                new Coin(secondaryAsset.denom, amounts.secondary.toFixed(0))
            )

        return nativeAssets
    }

    const buildFarmActions = (
        depositPrimary: Deposit,
        depositSecondary: Deposit,
        borrowAction: Borrow,
        amountToBorrow: number,
        amounts: StrategyAmounts
    ) => {
        const actions = []
        actions.push(depositPrimary)
        if (amounts.secondary > 0) actions.push(depositSecondary)
        if (amountToBorrow > 0) actions.push(borrowAction)
        actions.push(bond())

        return actions
    }

    const farmMessage = (amounts: StrategyAmounts) => {
        if (!strategy) return []
        // generate the message here depending on whether it is a native or not
        const depositPrimary = deposit(amounts.primary.toFixed(0), primaryAsset)
        const depositSecondary = deposit(
            amounts.secondary.toFixed(0),
            secondaryAsset
        )

        const amountToBorrow =
            Number(amounts.primary * poolPrice) - amounts.secondary

        const borrowAction: Borrow = borrow(amountToBorrow.toFixed(0))

        const nativeAssets = buildCoinArray(amounts)

        // build actions
        const actions = buildFarmActions(
            depositPrimary,
            depositSecondary,
            borrowAction,
            amountToBorrow,
            amounts
        )

        const messages = []
        if (!strategy.assets[0].native && strategy.assets[0].contract_addr)
            messages.push(
                increaseAllowance(
                    strategy.assets[0].contract_addr,
                    amounts.primary.toFixed(0),
                    strategy.contract_addr
                )
            )

        messages.push(
            updatePosition(strategy.contract_addr, actions, nativeAssets)
        )
        return amounts.primary === 0 && amounts.secondary === 0 ? [] : messages
    }

    const calculateSwapAndRepayAmounts = async (
        desiredDebtToRepay: number,
        totalPrimaryAvailable: number,
        totalSecondaryAvailable: number
    ): Promise<SwapAndRepay> => {
        if (!strategy) return { swapAmount: 0, repay: 0 }
        let swapAmount =
            desiredDebtToRepay > totalSecondaryAvailable
                ? await calculateSwapAmount(
                      strategy!,
                      desiredDebtToRepay,
                      totalSecondaryAvailable,
                      poolPrice
                  )
                : 0

        if (swapAmount > totalPrimaryAvailable) {
            swapAmount = totalPrimaryAvailable * SLIPPAGE_FACTOR // protect from time induced slippage

            // calculate how much we are going to get back from swap
            const secondaryRecievedFromSwap = await simulate(
                strategy.assets[0],
                swapAmount.toFixed(0),
                strategy.primary_pair.contract_addr
            )

            // don't apply slippage
            desiredDebtToRepay =
                Number(secondaryRecievedFromSwap?.return_amount) +
                totalSecondaryAvailable
        }

        return { swapAmount, repay: desiredDebtToRepay }
    }

    const manageMessage = async (amounts: StrategyAmounts) => {
        const actions = []

        if (!strategy) return []

        const initialBondUnits = new BigNumber(
            strategy?.position?.bond_units || 0
        )

        const primaryChange = Math.floor(
            Number(amounts.primary - primarySupplyAmount)
        )

        const secondaryChange = Math.floor(
            Number(amounts.secondary - availableSecondary)
        )

        const percentChange = Math.abs(primaryChange) / primarySupplyAmount

        const debtValue = Number(strategy.health?.debt_value)
        const debtChange = Number((amounts.debt - debtValue).toFixed(0))
        const nativeAssets: Coin[] = []

        // add coins for native tx's
        if (primaryAsset.native && primaryChange > 0)
            nativeAssets.push(
                new Coin(primaryAsset.denom, primaryChange.toFixed(0))
            )

        if (secondaryChange > 0 && secondaryAsset.native) {
            nativeAssets.push(
                new Coin(secondaryAsset.denom, secondaryChange.toFixed(0))
            )
        }

        const bondUnitsToUnlock: BigNumber =
            initialBondUnits.multipliedBy(percentChange)

        const { primaryAssetUnlocked, secondaryAssetUnlocked } =
            calculateUnlock(bondUnitsToUnlock.toNumber(), strategy)

        const totalSecondaryAvailable = secondaryAssetUnlocked + secondaryChange

        const remainingPrimary = primarySupplyAmount + primaryChange

        const depositPrimary = deposit(primaryChange.toFixed(0), primaryAsset)
        const depositSecondary = deposit(
            secondaryChange.toFixed(0),
            secondaryAsset
        )

        const primaryAllowanceIncrease = increaseAllowance(
            strategy.assets[0].contract_addr || '',
            primaryChange.toFixed(0),
            strategy.contract_addr
        )

        const secondaryAllowanceIncrease = increaseAllowance(
            strategy.assets[1].contract_addr || '',
            secondaryChange.toFixed(0),
            strategy.contract_addr
        )

        const messageArray = []

        if (!primaryAsset.native && primaryChange > 0)
            messageArray.push(primaryAllowanceIncrease)
        if (!secondaryAsset.native && secondaryChange > 0)
            messageArray.push(secondaryAllowanceIncrease)

        // CLOSE POSITION CASE
        if (amounts.primary === 0 && amounts.secondary === 0) {
            const debtToRepay = debtValue * 1.005 // add a little extra in case of interest

            const swapAmount = await calculateSwapAmount(
                strategy,
                debtToRepay,
                secondarySupplyAmount,
                poolPrice
            )

            // add commands to execute close
            actions.push(unbond(initialBondUnits.toFixed(0)))
            if (Number(swapAmount) > 0)
                actions.push(swap(Number(swapAmount || 0).toFixed(0)))
            if (debtToRepay > 0) actions.push(repay(debtToRepay.toFixed(0)))

            messageArray.push(updatePosition(strategy.contract_addr, actions))
        } else if (primaryChange > 0 && secondaryChange > 0) {
            const borrowChange = primaryChange * poolPrice
            const debtChange = borrowChange - secondaryChange
            const debtModifier =
                debtChange > 0
                    ? borrow(debtChange.toFixed(0))
                    : repay(Math.abs(debtChange).toFixed(0))

            if (
                Math.floor(primaryChange) > 0 &&
                Math.floor(secondaryChange) > 0
            ) {
                messageArray.push(
                    updatePosition(
                        strategy.contract_addr,
                        [
                            depositPrimary,
                            depositSecondary,
                            debtModifier,
                            bond(),
                        ],
                        nativeAssets
                    )
                )
            }
        } else if (primaryChange > 0 && secondaryChange === 0) {
            messageArray.push(
                updatePosition(
                    strategy.contract_addr,
                    [
                        depositPrimary,
                        borrow(Number(primaryChange * poolPrice).toFixed(0)),
                        bond(),
                    ],
                    nativeAssets
                )
            )
        } else if (primaryChange > 0 && secondaryChange < 0 && debtChange > 0) {
            const primaryChangeValue = primaryChange * poolPrice
            messageArray.push(
                updatePosition(
                    strategy.contract_addr,
                    [
                        depositPrimary,
                        borrow(primaryChangeValue.toFixed(0)),
                        bond(),
                        borrow(Math.abs(secondaryChange).toFixed(0)),
                    ],
                    nativeAssets
                )
            )
        } else if (primaryChange < 0 && secondaryChange < 0) {
            const primaryChangeValue = primaryChange * poolPrice
            const difference = primaryChangeValue - secondaryChange

            const unbondAction = unbond(bondUnitsToUnlock.toFixed(0))
            const ltvAction =
                difference < 0
                    ? repay(Math.abs(difference).toFixed(0))
                    : borrow(difference.toFixed(0))

            messageArray.push(
                updatePosition(strategy.contract_addr, [
                    unbondAction,
                    ltvAction,
                ])
            )
        } else if (primaryChange < 0 && secondaryChange > 0) {
            const debtTarget = remainingPrimary * poolPrice - amounts.secondary

            // how much I need to repay
            let debtToRepay = initialDebtAmount - debtTarget

            const { swapAmount, repay: repayAmount } =
                await calculateSwapAndRepayAmounts(
                    debtToRepay,
                    primaryAssetUnlocked,
                    totalSecondaryAvailable
                )
            debtToRepay = repayAmount * SLIPPAGE_FACTOR

            const unbondAction = unbond(bondUnitsToUnlock.toFixed(0))
            const repayAction = repay(debtToRepay.toFixed(0))
            actions.push(unbondAction)
            actions.push(depositSecondary)
            if (Number(swapAmount) > 0)
                actions.push(swap(Number(Number(swapAmount)).toFixed(0)))

            if (debtToRepay > 0) actions.push(repayAction)

            messageArray.push(
                updatePosition(strategy.contract_addr, actions, nativeAssets)
            )
        } else if (primaryChange < 0 && secondaryChange === 0) {
            const secondaryUnlocked = secondaryAssetUnlocked

            const primaryRemaining = primarySupplyAmount - primaryAssetUnlocked

            // required debt for 50% ltv
            const debtTarget = primaryRemaining * poolPrice - amounts.secondary

            let debtReduction = initialDebtAmount - debtTarget

            const { swapAmount, repay: repayAmount } =
                await calculateSwapAndRepayAmounts(
                    debtReduction,
                    primaryAssetUnlocked,
                    secondaryUnlocked
                )

            debtReduction = repayAmount * SLIPPAGE_FACTOR

            const unbondAction = unbond(bondUnitsToUnlock.toFixed(0))
            const swapAction = swap(swapAmount.toFixed(0))
            const payDebt = repay(debtReduction.toFixed(0))

            actions.push(unbondAction)
            if (Number(swapAmount) > 0) actions.push(swapAction)
            if (debtReduction) actions.push(payDebt)

            messageArray.push(updatePosition(strategy.contract_addr, actions))
        } else if (primaryChange === 0 && secondaryChange < 0) {
            messageArray.push(
                updatePosition(strategy.contract_addr, [
                    borrow(Math.abs(secondaryChange).toFixed(0)),
                ])
            )
        } else if (primaryChange === 0 && secondaryChange > 0) {
            const debtModifier = repay(secondaryChange.toFixed(0))

            messageArray.push(
                updatePosition(
                    strategy.contract_addr,
                    [depositSecondary, debtModifier],
                    nativeAssets
                )
            )
        }
        return messageArray
    }

    return { farmMessage, manageMessage }
}
