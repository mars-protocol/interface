export const DEFAULT_POSITION: Position = {
  status: 'active',
  accountId: '1',
  amounts: {
    primary: 0,
    secondary: 0,
    borrowed: 0,
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
    borrowed: 0,
    total: 0,
    net: 0,
  },
  apy: 0,
  ltv: 0.5,
  currentLeverage: 1,
}
