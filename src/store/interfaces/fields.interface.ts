import { AccountNftClient, CreditManagerClient } from 'types/classes'
import { MarsCreditManagerMessageComposer } from 'types/generated/mars-credit-manager/MarsCreditManager.message-composer'

export interface FieldsSlice {
  accountNftClient?: AccountNftClient
  creditManagerClient?: CreditManagerClient
  creditManagerMsgComposer?: MarsCreditManagerMessageComposer
  isRepay: boolean
  position?: Position
  setCreditManagerMsgComposer: (address: string, contract: string) => void
  setIsRepay: (isRepay: boolean) => void
  setPosition: (position?: Position) => void
}
