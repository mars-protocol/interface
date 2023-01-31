// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.24.0.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { Coin } from '@cosmjs/amino'
import { toUtf8 } from '@cosmjs/encoding'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgExecuteContractEncodeObject } from 'cosmwasm'

import { Uint128 } from './MarsMockVault.types'
export interface MarsMockVaultMessage {
  contractAddress: string
  sender: string
  deposit: (
    {
      amount,
      recipient,
    }: {
      amount: Uint128
      recipient?: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  redeem: (
    {
      amount,
      recipient,
    }: {
      amount: Uint128
      recipient?: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  vaultExtension: (funds?: Coin[]) => MsgExecuteContractEncodeObject
}
export class MarsMockVaultMessageComposer implements MarsMockVaultMessage {
  sender: string
  contractAddress: string

  constructor(sender: string, contractAddress: string) {
    this.sender = sender
    this.contractAddress = contractAddress
    this.deposit = this.deposit.bind(this)
    this.redeem = this.redeem.bind(this)
    this.vaultExtension = this.vaultExtension.bind(this)
  }

  deposit = (
    {
      amount,
      recipient,
    }: {
      amount: Uint128
      recipient?: string
    },
    funds?: Coin[],
  ): MsgExecuteContractEncodeObject => {
    return {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: this.sender,
        contract: this.contractAddress,
        msg: toUtf8(
          JSON.stringify({
            deposit: {
              amount,
              recipient,
            },
          }),
        ),
        funds,
      }),
    }
  }
  redeem = (
    {
      amount,
      recipient,
    }: {
      amount: Uint128
      recipient?: string
    },
    funds?: Coin[],
  ): MsgExecuteContractEncodeObject => {
    return {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: this.sender,
        contract: this.contractAddress,
        msg: toUtf8(
          JSON.stringify({
            redeem: {
              amount,
              recipient,
            },
          }),
        ),
        funds,
      }),
    }
  }
  vaultExtension = (funds?: Coin[]): MsgExecuteContractEncodeObject => {
    return {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: this.sender,
        contract: this.contractAddress,
        msg: toUtf8(
          JSON.stringify({
            vault_extension: {},
          }),
        ),
        funds,
      }),
    }
  }
}
