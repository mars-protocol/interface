import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export const getRequestUnlockActions = (amount: string, vaultAddress: string): Action[] => {
  return [
    {
      request_vault_unlock: {
        vault: { address: vaultAddress },
        amount: amount.toString(),
      },
    },
  ]
}
