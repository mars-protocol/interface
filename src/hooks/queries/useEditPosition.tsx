import BigNumber from 'bignumber.js'
import { SWAP_THRESHOLD } from 'constants/appConstants'
import { coinsToActionCoins, orderCoinsByDenom } from 'functions/fields'
import { useProvideLiquidity } from 'hooks/queries'
import { useMemo } from 'react'
import useStore from 'store'
import { Action, Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

import { useEstimateFarmFee } from './useEstimateFarmFee'

interface Props {
  accountId?: null | string
  prevPosition?: Position
  position: Position
  vault: Vault
  isReducingPosition: boolean
  isLoading: boolean
}

export const useEditPosition = (props: Props) => {
  const convertToBaseCurrency = useStore((s) => s.convertToBaseCurrency)
  const convertValueToAmount = useStore((s) => s.convertValueToAmount)
  const slippage = useStore((s) => s.slippage)

  const [editPosition, coinsAfterSwap] = useMemo<[Position, Coin[]]>(() => {
    const primaryAmount =
      props.position.amounts.primary - (props.prevPosition?.amounts.primary || 0)
    const secondaryAmount =
      props.position.amounts.secondary - (props.prevPosition?.amounts.secondary || 0)
    const borrowedPrimaryAmount =
      props.position.amounts.borrowedPrimary - (props.prevPosition?.amounts.borrowedPrimary || 0)

    const borrowedSecondaryAmount =
      props.position.amounts.borrowedSecondary -
      (props.prevPosition?.amounts.borrowedSecondary || 0)

    const editPosition = {
      ...props.position,
      amounts: {
        primary: primaryAmount,
        secondary: secondaryAmount,
        borrowedPrimary: borrowedPrimaryAmount,
        borrowedSecondary: borrowedSecondaryAmount,
        lp: {
          amount: '0',
          primary: 0,
          secondary: 0,
        },
        vault: '0',
      },
    }

    const primaryBaseAmount = convertToBaseCurrency({
      denom: props.vault.denoms.primary,
      amount: (primaryAmount + borrowedPrimaryAmount).toString(),
    })
    const secondaryBaseAmount = convertToBaseCurrency({
      denom: props.vault.denoms.secondary,
      amount: (secondaryAmount + borrowedSecondaryAmount).toString(),
    })

    let primaryAfterSwap = new BigNumber(primaryAmount).plus(borrowedPrimaryAmount)
    let secondaryAfterSwap = new BigNumber(secondaryAmount).plus(borrowedSecondaryAmount)

    // If difference is larger than threshold, initiate a swap
    const difference = primaryBaseAmount - secondaryBaseAmount
    if (Math.abs(difference) > SWAP_THRESHOLD) {
      const swapInput = difference > 0 ? 'primary' : 'secondary'
      const swapTarget = difference < 0 ? 'primary' : 'secondary'
      const inputAmount = Math.floor(Math.abs(difference) / 2)
      const amount = Math.floor(
        convertValueToAmount({
          denom: props.vault.denoms[swapTarget],
          amount: inputAmount.toString(),
        }),
      )

      const primaryBaseChange = swapInput === 'primary' ? -inputAmount : amount
      const secondaryBaseChange = swapInput === 'secondary' ? -inputAmount : amount

      const primaryAmountChange = Math.floor(
        convertValueToAmount({
          denom: props.vault.denoms.primary,
          amount: primaryBaseChange.toString(),
        }),
      )
      const secondaryAmountChange = Math.floor(
        convertValueToAmount({
          denom: props.vault.denoms.secondary,
          amount: secondaryBaseChange.toString(),
        }),
      )

      primaryAfterSwap = primaryAfterSwap.plus(primaryAmountChange)
      secondaryAfterSwap = secondaryAfterSwap.plus(secondaryAmountChange)
    }
    const coins: Coin[] = [
      {
        denom: props.vault.denoms.secondary,
        amount: secondaryAfterSwap.toString(),
      },
      {
        denom: props.vault.denoms.primary,
        amount: primaryAfterSwap.toString(),
      },
    ]

    return [editPosition, coins]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.position.amounts.primary,
    props.position.amounts.secondary,
    props.position.amounts.borrowedPrimary,
    props.position.amounts.borrowedSecondary,
  ])

  const { data: minLpToReceive } = useProvideLiquidity({
    coins: coinsAfterSwap,
    vault: props.vault,
  })

  const { actions, funds } = useMemo<{ actions: Action[]; funds: Coin[] }>(() => {
    if (!minLpToReceive || props.isReducingPosition) return { actions: [], funds: [] }

    const coins: { supply: Coin[]; borrow?: Coin } = { supply: [], borrow: undefined }

    const primary = editPosition.amounts.primary && {
      denom: props.vault.denoms.primary,
      amount: editPosition.amounts.primary.toString(),
    }

    const secondary = editPosition.amounts.secondary && {
      denom: props.vault.denoms.secondary,
      amount: editPosition.amounts.secondary.toString(),
    }

    const borrow = editPosition.borrowDenom && {
      denom: editPosition.borrowDenom,
      amount: Math.max(
        editPosition.amounts.borrowedPrimary,
        editPosition.amounts.borrowedSecondary,
      ).toString(),
    }

    if (primary) coins.supply.push(primary)
    if (secondary) coins.supply.push(secondary)
    if (borrow) coins.borrow = borrow

    const primaryBaseAmount = convertToBaseCurrency({
      denom: props.vault.denoms.primary,
      amount: (editPosition.amounts.primary + editPosition.amounts.borrowedPrimary).toString(),
    })

    const secondaryBaseAmount = convertToBaseCurrency({
      denom: props.vault.denoms.secondary,
      amount: (editPosition.amounts.secondary + editPosition.amounts.borrowedSecondary).toString(),
    })

    const swapMessage: Action[] = []

    // If difference is larger than 10 ubase, initiate a swap
    const difference = primaryBaseAmount - secondaryBaseAmount

    if (Math.abs(difference) > SWAP_THRESHOLD) {
      const inputDenom = difference > 0 ? props.vault.denoms.primary : props.vault.denoms.secondary
      const outputDenom = difference < 0 ? props.vault.denoms.primary : props.vault.denoms.secondary
      const amount = new BigNumber(difference).abs().div(2).toString()
      const swapAmount = Math.ceil(convertValueToAmount({ denom: inputDenom, amount: amount }))

      swapMessage.push({
        swap_exact_in: {
          coin_in: {
            denom: inputDenom,
            amount: {
              exact: swapAmount.toString(),
            },
          },
          denom_out: outputDenom,
          slippage: slippage.toString(),
        },
      })
    }

    BigNumber.config({ EXPONENTIAL_AT: [-7, 30] })
    const minimumReceive = new BigNumber(minLpToReceive)
      .times(1 - slippage)
      .dp(0)
      .toString()

    const actions: Action[] = [
      ...(coins.supply[0]
        ? [
            {
              deposit: coins.supply[0],
            },
          ]
        : []),
      ...(coins.supply[1] ? [{ deposit: coins.supply[1] }] : []),
      ...(coins.borrow ? [{ borrow: coins.borrow }] : []),
      ...swapMessage,
      {
        provide_liquidity: {
          coins_in: coinsToActionCoins(coinsAfterSwap),
          lp_token_out: props.vault?.denoms.lpToken || '',
          minimum_receive: minimumReceive,
        },
      },
      {
        enter_vault: {
          coin: {
            denom: props.vault?.denoms.lpToken || '',
            amount: 'account_balance',
          },
          vault: {
            address: props.vault?.address || '',
          },
        },
      },
    ]

    return {
      actions,
      funds: orderCoinsByDenom(coins.supply) || [],
    }
  }, [
    editPosition,
    minLpToReceive,
    props.vault,
    coinsAfterSwap,
    convertToBaseCurrency,
    convertValueToAmount,
    slippage,
    props.isReducingPosition,
  ])

  const {
    data: fee,
    isLoading,
    error,
  } = useEstimateFarmFee({
    accountId: props.accountId,
    actions: actions,
    funds,
    isCreate: false,
    isLoading: props.isLoading,
  })

  return { editActions: actions, editFunds: funds, editFee: fee, isLoading, error }
}
