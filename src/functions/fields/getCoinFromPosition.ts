export const getCoinFromPosition = (
  position: Position,
  vault: Vault,
  type: 'primary' | 'secondary' | 'borrowed',
) => {
  const denom = type === 'primary' ? vault.denoms.primary : vault.denoms.secondary
  return {
    denom,
    amount: position.amounts[type].toString(),
  }
}
