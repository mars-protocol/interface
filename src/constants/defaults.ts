export const DEFAULT_POSITION: Position = {
  status: 'active',
  accountId: '1',
  amounts: {
    primary: 0,
    secondary: 0,
    borrowedPrimary: 0,
    borrowedSecondary: 0,
    lp: {
      amount: '0',
      primary: 0,
      secondary: 0,
    },
    vault: '0',
  },
  values: {
    primary: 0,
    secondary: 0,
    borrowedPrimary: 0,
    borrowedSecondary: 0,
    total: 0,
    net: 0,
  },
  apy: {
    total: 19,
    borrow: 5.2,
    net: 13.8,
    vaultAddress: '',
  },
  ltv: 0.5,
  currentLeverage: 1,
  borrowDenom: null,
}
