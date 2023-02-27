interface ActiveVault extends Vault {
  position: Position
}

interface Vault {
  address: string
  name: string
  description: string
  provider: string
  denoms: {
    primary: string
    secondary: string
    lpToken: string
  }
  symbols: {
    primary: string
    secondary: string
  }
  color: string
  lockup: number
  ltv: {
    max: number
    contract: number
    liq: number
  }
  vaultCap?: {
    denom: string
    used: number
    max: number
  }
  apy: number | null
}

interface Position {
  id?: number
  status: 'active' | 'unlocking' | 'unlocked'
  accountId: string
  amounts: {
    primary: number
    secondary: number
    borrowed: number
    lp: {
      amount: string // Need to be string as number can be extremely large
      primary: number
      secondary: number
    }
    vault: string // Need to be string as number can be extremely large
  }
  values: {
    primary: number
    secondary: number
    borrowed: number
    total: number
    net: number
  }
  apy: {
    total: number | null
    borrow: number
    net: number | null
  }
  ltv: number
  currentLeverage: number
  unlockAtTimestamp?: number
}

interface PositionBarItem {
  name: string
  color: string
  coin: {
    denom: string
    amount: string
  }
}

interface LpTokenWithAddress {
  locked: number
  unlocking: string
  unlocked: string
  denom: string
  vaultAddress: string
}

interface VaultCoinsWithAddress {
  coins: Coin[]
  vaultAddress: string
}

interface UnlockTimeWithAddress {
  unlockAtTimestamp: number
  vaultAddress: string
}

interface FieldsAction {
  label: string
  values: string[]
}

interface AprData {
  contractAddress: string
  apr: number
}

interface FlatApr {
  contract_address: string
  apr: { type: string; value: number | string }[]
  fees: { type: string; value: number | string }[]
}

interface NestedApr {
  contract_address: string
  apr: {
    aprs: { type: string; value: number | string }[]
    fees: { type: string; value: number | string }[]
  }
}

interface VaultCapData {
  address: string
  vaultCap: {
    denom: string
    used: number
    max: number
  }
}
