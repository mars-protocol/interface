// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.24.0.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { StdFee } from '@cosmjs/amino'
import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query'

import { MarsZapperBaseClient, MarsZapperBaseQueryClient } from './MarsZapperBase.client'
import { ArrayOfCoin, Coin, Uint128 } from './MarsZapperBase.types'
export const marsZapperBaseQueryKeys = {
  contract: [
    {
      contract: 'marsZapperBase',
    },
  ] as const,
  address: (contractAddress: string | undefined) =>
    [{ ...marsZapperBaseQueryKeys.contract[0], address: contractAddress }] as const,
  estimateProvideLiquidity: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      {
        ...marsZapperBaseQueryKeys.address(contractAddress)[0],
        method: 'estimate_provide_liquidity',
        args,
      },
    ] as const,
  estimateWithdrawLiquidity: (
    contractAddress: string | undefined,
    args?: Record<string, unknown>,
  ) =>
    [
      {
        ...marsZapperBaseQueryKeys.address(contractAddress)[0],
        method: 'estimate_withdraw_liquidity',
        args,
      },
    ] as const,
}
export interface MarsZapperBaseReactQuery<TResponse, TData = TResponse> {
  client: MarsZapperBaseQueryClient | undefined
  options?: Omit<
    UseQueryOptions<TResponse, Error, TData>,
    "'queryKey' | 'queryFn' | 'initialData'"
  > & {
    initialData?: undefined
  }
}
export interface MarsZapperBaseEstimateWithdrawLiquidityQuery<TData>
  extends MarsZapperBaseReactQuery<ArrayOfCoin, TData> {
  args: {
    coinIn: Coin
  }
}
export function useMarsZapperBaseEstimateWithdrawLiquidityQuery<TData = ArrayOfCoin>({
  client,
  args,
  options,
}: MarsZapperBaseEstimateWithdrawLiquidityQuery<TData>) {
  return useQuery<ArrayOfCoin, Error, TData>(
    marsZapperBaseQueryKeys.estimateWithdrawLiquidity(client?.contractAddress, args),
    () =>
      client
        ? client.estimateWithdrawLiquidity({
            coinIn: args.coinIn,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsZapperBaseEstimateProvideLiquidityQuery<TData>
  extends MarsZapperBaseReactQuery<Uint128, TData> {
  args: {
    coinsIn: Coin[]
    lpTokenOut: string
  }
}
export function useMarsZapperBaseEstimateProvideLiquidityQuery<TData = Uint128>({
  client,
  args,
  options,
}: MarsZapperBaseEstimateProvideLiquidityQuery<TData>) {
  return useQuery<Uint128, Error, TData>(
    marsZapperBaseQueryKeys.estimateProvideLiquidity(client?.contractAddress, args),
    () =>
      client
        ? client.estimateProvideLiquidity({
            coinsIn: args.coinsIn,
            lpTokenOut: args.lpTokenOut,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsZapperBaseCallbackMutation {
  client: MarsZapperBaseClient
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsZapperBaseCallbackMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsZapperBaseCallbackMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsZapperBaseCallbackMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.callback(msg, fee, memo, funds),
    options,
  )
}
export interface MarsZapperBaseWithdrawLiquidityMutation {
  client: MarsZapperBaseClient
  msg: {
    recipient?: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsZapperBaseWithdrawLiquidityMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsZapperBaseWithdrawLiquidityMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsZapperBaseWithdrawLiquidityMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) =>
      client.withdrawLiquidity(msg, fee, memo, funds),
    options,
  )
}
export interface MarsZapperBaseProvideLiquidityMutation {
  client: MarsZapperBaseClient
  msg: {
    lpTokenOut: string
    minimumReceive: Uint128
    recipient?: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsZapperBaseProvideLiquidityMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsZapperBaseProvideLiquidityMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsZapperBaseProvideLiquidityMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) =>
      client.provideLiquidity(msg, fee, memo, funds),
    options,
  )
}
