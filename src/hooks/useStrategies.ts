import { MsgExecuteContract, Coins, Coin } from '@terra-money/terra.js'
import useStore from '../store'

export interface CW20 {
    cw20: string
}

export interface Native {
    native: string
}
export interface Asset {
    info: CW20 | Native
    amount: string
}

export interface Deposit {
    deposit: {
        info: CW20 | Native
        amount: string
    }
}

export interface Withdraw {} // todo need this?

export interface Repay {
    amount: string
}

export interface Borrow {
    borrow: {
        amount: string
    }
}

export interface Bond {}

export interface Unbond {
    amount: string
}

export type Action = Deposit | Borrow | Repay | Withdraw | Bond | Unbond

export const useUpdatePosition = () => {
    const sender = useStore((s) => s.userWalletAddress)

    return (contract: string, actions: Action[], coins?: Coins.Input) =>
        new MsgExecuteContract(
            sender,
            contract,
            {
                update_position: actions,
            },
            coins ? coins : []
        )
}

export const useIncreaseAllowance = () => {
    const sender = useStore((s) => s.userWalletAddress)

    return (contract: string, allowance: string, spender: string) =>
        new MsgExecuteContract(
            sender,
            contract,
            {
                increase_allowance: {
                    amount: allowance,
                    spender: spender,
                },
            },
            new Coins([])
        )
}

export const unbond = (bondUnitsToUnlock: string) => {
    return {
        unbond: {
            bond_units_to_reduce: bondUnitsToUnlock,
        },
    }
}

export const bond = () => {
    return {
        bond: {
            slippage_tolerance: '0.01',
        },
    }
}

export const swap = (swapAmount: string) => {
    return {
        swap: {
            offer_amount: swapAmount,
            max_spread: '0.05',
        },
    }
}

export const repay = (repayAmount: string) => {
    return {
        repay: {
            amount: repayAmount,
        },
    }
}

export const borrow = (amount: string) => {
    return {
        borrow: {
            amount: amount,
        },
    }
}

const produceAssetInfo = (asset: WhitelistAsset): CW20 | Native => {
    return asset.native
        ? { native: asset.denom || '' }
        : { cw20: asset.contract_addr || '' }
}
export const deposit = (amount: string, asset: WhitelistAsset): Deposit => {
    return {
        deposit: {
            info: produceAssetInfo(asset),
            amount: amount,
        },
    }
}

export const useIncreasePosition = () => {
    const sender = useStore((s) => s.userWalletAddress)

    return (
        contract: string,
        token1: WhitelistAsset,
        token1Amount: string,
        token2: WhitelistAsset,
        token2Amount: string
    ) =>
        new MsgExecuteContract(
            sender,
            contract,
            token2.native
                ? {
                      increase_position: {
                          deposits: [
                              {
                                  info: {
                                      cw20: {
                                          contract_addr: token1.contract_addr,
                                      },
                                  },
                                  amount: token1Amount,
                              },
                              {
                                  info: {
                                      native: {
                                          denom: token2.denom,
                                      },
                                  },
                                  amount: token2Amount,
                              },
                          ],
                      },
                  }
                : {
                      increase_position: {
                          deposits: [
                              {
                                  info: {
                                      cw20: {
                                          contract_addr: token1.contract_addr,
                                      },
                                  },
                                  amount: token1Amount,
                              },
                              {
                                  info: {
                                      cw20: {
                                          contract_addr: token2.contract_addr,
                                      },
                                  },
                                  amount: token2Amount,
                              },
                          ],
                      },
                  },
            new Coins(
                token2.native && Number(token2Amount) > 0
                    ? [
                          Coin.fromData({
                              denom: token2.denom,
                              amount: token2Amount,
                          }),
                      ]
                    : []
            )
        )
}

export const useReducePosition = () => {
    const sender = useStore((s) => s.userWalletAddress)

    return (
        contract: string,
        bondUnits: string,
        swapAmount: string,
        repayAmount: string
    ) =>
        new MsgExecuteContract(
            sender,
            contract,
            {
                reduce_position: {
                    bond_units: bondUnits,
                    swap_amount: swapAmount,
                    repay_amount: repayAmount,
                },
            },
            new Coins([])
        )
}

export const usePayDebt = () => {
    const sender = useStore((s) => s.userWalletAddress)
    const taxOverpay = 5000000

    return (contract: string, debt: number) =>
        new MsgExecuteContract(
            sender,
            contract,
            {
                pay_debt: {
                    repay_amount: debt.toFixed(0),
                },
            },
            {
                uusd: Number(debt + taxOverpay).toFixed(0), // need to pay tax
            }
        )
}
