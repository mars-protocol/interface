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

import { CreateOrUpdateConfig, InitOrUpdateAssetParams, Uint128 } from './MarsMockRedBank.types'
export interface MarsMockRedBankMessage {
  contractAddress: string
  sender: string
  updateConfig: (
    {
      config,
    }: {
      config: CreateOrUpdateConfig
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  initAsset: (
    {
      denom,
      params,
    }: {
      denom: string
      params: InitOrUpdateAssetParams
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  updateAsset: (
    {
      denom,
      params,
    }: {
      denom: string
      params: InitOrUpdateAssetParams
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  updateUncollateralizedLoanLimit: (
    {
      denom,
      newLimit,
      user,
    }: {
      denom: string
      newLimit: Uint128
      user: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  deposit: (
    {
      onBehalfOf,
    }: {
      onBehalfOf?: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  withdraw: (
    {
      amount,
      denom,
      recipient,
    }: {
      amount?: Uint128
      denom: string
      recipient?: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  borrow: (
    {
      amount,
      denom,
      recipient,
    }: {
      amount: Uint128
      denom: string
      recipient?: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  repay: (
    {
      onBehalfOf,
    }: {
      onBehalfOf?: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  liquidate: (
    {
      collateralDenom,
      recipient,
      user,
    }: {
      collateralDenom: string
      recipient?: string
      user: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  updateAssetCollateralStatus: (
    {
      denom,
      enable,
    }: {
      denom: string
      enable: boolean
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
}
export class MarsMockRedBankMessageComposer implements MarsMockRedBankMessage {
  sender: string
  contractAddress: string

  constructor(sender: string, contractAddress: string) {
    this.sender = sender
    this.contractAddress = contractAddress
    this.updateConfig = this.updateConfig.bind(this)
    this.initAsset = this.initAsset.bind(this)
    this.updateAsset = this.updateAsset.bind(this)
    this.updateUncollateralizedLoanLimit = this.updateUncollateralizedLoanLimit.bind(this)
    this.deposit = this.deposit.bind(this)
    this.withdraw = this.withdraw.bind(this)
    this.borrow = this.borrow.bind(this)
    this.repay = this.repay.bind(this)
    this.liquidate = this.liquidate.bind(this)
    this.updateAssetCollateralStatus = this.updateAssetCollateralStatus.bind(this)
  }

  updateConfig = (
    {
      config,
    }: {
      config: CreateOrUpdateConfig
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
            update_config: {
              config,
            },
          }),
        ),
        funds,
      }),
    }
  }
  initAsset = (
    {
      denom,
      params,
    }: {
      denom: string
      params: InitOrUpdateAssetParams
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
            init_asset: {
              denom,
              params,
            },
          }),
        ),
        funds,
      }),
    }
  }
  updateAsset = (
    {
      denom,
      params,
    }: {
      denom: string
      params: InitOrUpdateAssetParams
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
            update_asset: {
              denom,
              params,
            },
          }),
        ),
        funds,
      }),
    }
  }
  updateUncollateralizedLoanLimit = (
    {
      denom,
      newLimit,
      user,
    }: {
      denom: string
      newLimit: Uint128
      user: string
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
            update_uncollateralized_loan_limit: {
              denom,
              new_limit: newLimit,
              user,
            },
          }),
        ),
        funds,
      }),
    }
  }
  deposit = (
    {
      onBehalfOf,
    }: {
      onBehalfOf?: string
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
              on_behalf_of: onBehalfOf,
            },
          }),
        ),
        funds,
      }),
    }
  }
  withdraw = (
    {
      amount,
      denom,
      recipient,
    }: {
      amount?: Uint128
      denom: string
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
            withdraw: {
              amount,
              denom,
              recipient,
            },
          }),
        ),
        funds,
      }),
    }
  }
  borrow = (
    {
      amount,
      denom,
      recipient,
    }: {
      amount: Uint128
      denom: string
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
            borrow: {
              amount,
              denom,
              recipient,
            },
          }),
        ),
        funds,
      }),
    }
  }
  repay = (
    {
      onBehalfOf,
    }: {
      onBehalfOf?: string
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
            repay: {
              on_behalf_of: onBehalfOf,
            },
          }),
        ),
        funds,
      }),
    }
  }
  liquidate = (
    {
      collateralDenom,
      recipient,
      user,
    }: {
      collateralDenom: string
      recipient?: string
      user: string
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
            liquidate: {
              collateral_denom: collateralDenom,
              recipient,
              user,
            },
          }),
        ),
        funds,
      }),
    }
  }
  updateAssetCollateralStatus = (
    {
      denom,
      enable,
    }: {
      denom: string
      enable: boolean
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
            update_asset_collateral_status: {
              denom,
              enable,
            },
          }),
        ),
        funds,
      }),
    }
  }
}
