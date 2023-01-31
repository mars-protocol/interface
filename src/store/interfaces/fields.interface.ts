import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { MarsAccountNftInterface } from 'types/generated/mars-account-nft/MarsAccountNft.client'
import { MarsCreditManagerClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { MarsCreditManagerMessageComposer } from 'types/generated/mars-credit-manager/MarsCreditManager.message-composer'

export interface FieldsSlice {
  accountNftClient?: MarsAccountNftInterface
  creditManagerClient?: MarsCreditManagerClient
  creditManagerMsgComposer?: MarsCreditManagerMessageComposer
  isRepay: boolean
  position?: Position
  setAccountNftClient: (client: SigningCosmWasmClient) => void
  setCreditManagerClient: (client: SigningCosmWasmClient) => void
  setCreditManagerMsgComposer: (address: string, contract: string) => void
  setIsRepay: (isRepay: boolean) => void
  setPosition: (position?: Position) => void
}
