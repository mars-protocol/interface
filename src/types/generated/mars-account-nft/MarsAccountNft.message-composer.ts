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

import { Binary, ConfigUpdates, Expiration } from './MarsAccountNft.types'
export interface MarsAccountNftMessage {
  contractAddress: string
  sender: string
  updateConfig: (
    {
      updates,
    }: {
      updates: ConfigUpdates
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  acceptMinterRole: (funds?: Coin[]) => MsgExecuteContractEncodeObject
  mint: (
    {
      user,
    }: {
      user: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  burn: (
    {
      tokenId,
    }: {
      tokenId: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  transferNft: (
    {
      recipient,
      tokenId,
    }: {
      recipient: string
      tokenId: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  sendNft: (
    {
      contract,
      msg,
      tokenId,
    }: {
      contract: string
      msg: Binary
      tokenId: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  approve: (
    {
      expires,
      spender,
      tokenId,
    }: {
      expires?: Expiration
      spender: string
      tokenId: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  revoke: (
    {
      spender,
      tokenId,
    }: {
      spender: string
      tokenId: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  approveAll: (
    {
      expires,
      operator,
    }: {
      expires?: Expiration
      operator: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  revokeAll: (
    {
      operator,
    }: {
      operator: string
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
}
export class MarsAccountNftMessageComposer implements MarsAccountNftMessage {
  sender: string
  contractAddress: string

  constructor(sender: string, contractAddress: string) {
    this.sender = sender
    this.contractAddress = contractAddress
    this.updateConfig = this.updateConfig.bind(this)
    this.acceptMinterRole = this.acceptMinterRole.bind(this)
    this.mint = this.mint.bind(this)
    this.burn = this.burn.bind(this)
    this.transferNft = this.transferNft.bind(this)
    this.sendNft = this.sendNft.bind(this)
    this.approve = this.approve.bind(this)
    this.revoke = this.revoke.bind(this)
    this.approveAll = this.approveAll.bind(this)
    this.revokeAll = this.revokeAll.bind(this)
  }

  updateConfig = (
    {
      updates,
    }: {
      updates: ConfigUpdates
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
              updates,
            },
          }),
        ),
        funds,
      }),
    }
  }
  acceptMinterRole = (funds?: Coin[]): MsgExecuteContractEncodeObject => {
    return {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: this.sender,
        contract: this.contractAddress,
        msg: toUtf8(
          JSON.stringify({
            accept_minter_role: {},
          }),
        ),
        funds,
      }),
    }
  }
  mint = (
    {
      user,
    }: {
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
            mint: {
              user,
            },
          }),
        ),
        funds,
      }),
    }
  }
  burn = (
    {
      tokenId,
    }: {
      tokenId: string
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
            burn: {
              token_id: tokenId,
            },
          }),
        ),
        funds,
      }),
    }
  }
  transferNft = (
    {
      recipient,
      tokenId,
    }: {
      recipient: string
      tokenId: string
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
            transfer_nft: {
              recipient,
              token_id: tokenId,
            },
          }),
        ),
        funds,
      }),
    }
  }
  sendNft = (
    {
      contract,
      msg,
      tokenId,
    }: {
      contract: string
      msg: Binary
      tokenId: string
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
            send_nft: {
              contract,
              msg,
              token_id: tokenId,
            },
          }),
        ),
        funds,
      }),
    }
  }
  approve = (
    {
      expires,
      spender,
      tokenId,
    }: {
      expires?: Expiration
      spender: string
      tokenId: string
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
            approve: {
              expires,
              spender,
              token_id: tokenId,
            },
          }),
        ),
        funds,
      }),
    }
  }
  revoke = (
    {
      spender,
      tokenId,
    }: {
      spender: string
      tokenId: string
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
            revoke: {
              spender,
              token_id: tokenId,
            },
          }),
        ),
        funds,
      }),
    }
  }
  approveAll = (
    {
      expires,
      operator,
    }: {
      expires?: Expiration
      operator: string
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
            approve_all: {
              expires,
              operator,
            },
          }),
        ),
        funds,
      }),
    }
  }
  revokeAll = (
    {
      operator,
    }: {
      operator: string
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
            revoke_all: {
              operator,
            },
          }),
        ),
        funds,
      }),
    }
  }
}
