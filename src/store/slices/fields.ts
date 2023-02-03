import { FieldsSlice } from 'store/interfaces/fields.interface'
import { Store } from 'store/interfaces/store.interface'
import { MarsCreditManagerMessageComposer } from 'types/generated/mars-credit-manager/MarsCreditManager.message-composer'
import { GetState } from 'zustand'
import { NamedSet } from 'zustand/middleware'

const fieldsSlice = (set: NamedSet<Store>, get: GetState<Store>): FieldsSlice => ({
  isRepay: false,
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
