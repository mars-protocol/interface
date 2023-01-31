import {
  LockingVaultAmount,
  VaultAmount,
  VaultPositionAmount,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export const getAmountsFromActiveVault = (vaultPositionAmount: VaultPositionAmount) => {
  const amounts = {
    locked: '0',
    unlocking: '0',
    unlocked: '0',
  }

  if (Object.keys(vaultPositionAmount)[0] === 'locking') {
    const lockingVaultAmount = (vaultPositionAmount as any).locking as LockingVaultAmount
    amounts.locked = lockingVaultAmount.locked || '0'
    amounts.unlocking = lockingVaultAmount.unlocking[0]?.coin.amount || '0'
  }
  if (Object.keys(vaultPositionAmount)[0] === 'unlocked') {
    const lockingVaultAmount = (vaultPositionAmount as any).locking as VaultAmount
    amounts.unlocked = lockingVaultAmount || '0'
  }

  return amounts
}
