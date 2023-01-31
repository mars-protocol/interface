import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { FieldsSlice } from 'store/interfaces/fields.interface'
import { Store } from 'store/interfaces/store.interface'
import { MarsAccountNftClient } from 'types/generated/mars-account-nft/MarsAccountNft.client'
import { MarsCreditManagerClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { MarsCreditManagerMessageComposer } from 'types/generated/mars-credit-manager/MarsCreditManager.message-composer'
import { GetState } from 'zustand'
import { NamedSet } from 'zustand/middleware'

const fieldsSlice = (set: NamedSet<Store>, get: GetState<Store>): FieldsSlice => ({
  isRepay: false,
  setAccountNftClient: (client: SigningCosmWasmClient) => {
    const contracts = get().networkConfig?.contracts
    const userWalletAddress = get().userWalletAddress

    if (contracts?.accountNft) {
      set({
        accountNftClient: new MarsAccountNftClient(client, userWalletAddress, contracts.accountNft),
      })
    }
  },
  setCreditManagerClient: (client: SigningCosmWasmClient) => {
    const contracts = get().networkConfig?.contracts
    const userWalletAddress = get().userWalletAddress

    if (contracts?.accountNft && userWalletAddress) {
      set({
        creditManagerClient: new MarsCreditManagerClient(
          client,
          userWalletAddress,
          contracts.creditManager,
        ),
      })
    }
  },
  setCreditManagerMsgComposer: (sender: string, contract: string) => {
    set({ creditManagerMsgComposer: new MarsCreditManagerMessageComposer(sender, contract) })
  },
  setIsRepay: (isRepay: boolean) => {
    set({ isRepay })
  },
  setPosition: (position?: Position) => {
    set({ position })
  },
})

export default fieldsSlice
