import { Coin } from '@cosmjs/stargate'
import {
  ArrayOfCoin,
  QueryMsg as CreditQueryMsg,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'

import { QueryMsg as AccountQueryMsg } from './generated/mars-account-nft/MarsAccountNft.types'
import { QueryMsg as VaultQueryMsg } from './generated/mars-mock-vault/MarsMockVault.types'

export class SetupError extends Error {
  constructor(name: string, message: string) {
    super(message)
    this.name = name
  }
}

export class CreditManagerClient {
  address: string
  client: WalletClient

  constructor(address: string, client: WalletClient) {
    this.address = address
    this.client = client
  }

  query(message: CreditQueryMsg) {
    return this.client.cosmWasmClient.queryContractSmart(this.address, message)
  }

  estimateWithdrawLiquidity({ lpToken }: { lpToken: Coin }) {
    return Promise<ArrayOfCoin>
  }
}

export class AccountNftClient {
  address: string
  client: WalletClient

  constructor(address: string, client: WalletClient) {
    this.address = address
    this.client = client
  }

  query(message: AccountQueryMsg) {
    return this.client.cosmWasmClient.queryContractSmart(this.address, message)
  }
}

export class VaultClient {
  address: string
  client: WalletClient

  constructor(address: string, client: WalletClient) {
    this.address = address
    this.client = client
  }

  query(message: VaultQueryMsg) {
    return this.client.cosmWasmClient.queryContractSmart(this.address, message)
  }
}
