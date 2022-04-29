import createContext from './createContext'
import { useContract } from './useContract'

interface ReverseSimulationResult {
    offer_amount: string
    spread_amount: string
    commission_amount: string
}

interface SimulationResult {
    return_amount: string
    spread_amount: string
    commission_amount: string
}

interface SimulateSwap {
    calculateSwapAmount: (
        strategy: StrategyObject,
        secondaryRequired: number,
        secondaryUnlocked: number,
        primaryAssetPrice: number
    ) => Promise<number>
    getSwapResult: (
        token: WhitelistAsset | undefined,
        amount: string,
        pairAddress: string
    ) => Promise<ReverseSimulationResult | undefined>

    simulate: (
        token: WhitelistAsset | undefined,
        amount: string,
        pairAddress: string
    ) => Promise<SimulationResult | undefined>
}

export const [useSimulateSwap, SwapProvider] =
    createContext<SimulateSwap>('useSimulateSwap')

export const useSimulateSwapState = (): SimulateSwap => {
    const { query } = useContract()

    const calculateSwapAmount = async (
        strategy: StrategyObject,
        secondaryRequired: number,
        secondaryUnlocked: number,
        primaryAssetPrice: number
    ): Promise<number> => {
        // If we do not have enough secondary asset unlocked to pay the equivelent (due to IL) then we need to swap some
        const difference = secondaryUnlocked - secondaryRequired
        if (difference >= 0) return 0

        const result = await reverseSimulate(
            strategy.assets[1], // strategy.assets comes from the config. [1] should always be the secondary asset.
            Math.abs(difference).toFixed(0),
            strategy.primary_pair.contract_addr
        )

        const offerAmount = Number(result?.offer_amount || 0) * 1.01 // for slippage

        // Ensure that we are returning the amount to swap denominated in secondary
        return Number(offerAmount)
    }

    const simulate = async (
        token: WhitelistAsset | undefined,
        amount: string,
        pairAddress: string
    ) => {
        const queryObject = token?.native
            ? {
                  simulation: {
                      offer_asset: {
                          info: {
                              native_token: {
                                  denom: token.denom,
                              },
                          },
                          amount: amount,
                      },
                  },
              }
            : {
                  simulation: {
                      offer_asset: {
                          info: {
                              token: {
                                  contract_addr: token?.contract_addr,
                              },
                          },
                          amount: amount,
                      },
                  },
              }

        const swapResult = await query<Promise<SimulationResult>>(
            pairAddress,
            queryObject
        )

        return swapResult
    }

    const reverseSimulate = async (
        token: WhitelistAsset | undefined,
        amount: string,
        pairAddress: string
    ) => {
        const queryObject = token?.native
            ? {
                  reverse_simulation: {
                      ask_asset: {
                          info: {
                              native_token: {
                                  denom: token.denom,
                              },
                          },
                          amount: amount,
                      },
                  },
              }
            : {
                  reverse_simulation: {
                      ask_asset: {
                          info: {
                              token: {
                                  contract_addr: token?.contract_addr,
                              },
                          },
                          amount: amount,
                      },
                  },
              }

        const swapResult = await query<Promise<ReverseSimulationResult>>(
            pairAddress,
            queryObject
        )

        return swapResult
    }

    return { getSwapResult: reverseSimulate, calculateSwapAmount, simulate }
}
