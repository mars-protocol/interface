export const vault: Vault = {
  address: 'test',
  apy: 10,
  color: 'test',
  denoms: {
    primary: 'OSMO',
    secondary: 'ATOM',
    lpToken: 'LP',
  },
  description: 'test vault',
  ltv: {
    max: 0.5,
    contract: 0.52,
    liq: 0.6,
  },
  lockup: 5,
  name: 'test vault',
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
