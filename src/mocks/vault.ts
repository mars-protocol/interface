export const vault: Vault = {
  address: 'test',
  apy: {
    apys: null,
    fees: null,
    total: null,
    vaultAddress: '',
  },
  color: 'test',
  denoms: {
    primary: 'OSMO',
    secondary: 'ATOM',
    lpToken: 'LP',
  },
  description: { maxLeverage: 2.78, lpName: 'test' },
  ltv: {
    max: 0.5,
    contract: 0.52,
    liq: 0.6,
  },
  lockup: 5,
  name: { name: 'test LP', unlockDuration: 10, unlockTimeframe: 'minutes' },
  provider: 'testing',
  symbols: {
    primary: 'OSMO',
    secondary: 'ATOM',
  },
  vaultCap: {
    denom: 'uosmo',
    used: 1000,
    max: 5000,
  },
}
