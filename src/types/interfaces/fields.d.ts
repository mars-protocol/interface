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
    used: number
    max: number
  }
  apy?: number
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
  apy: number
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

interface AprResponse {
  contract_address: string
  aprs: { type: string; value: number }[]
  fees: { type: string; value: number }[]
}

interface VaultCapData {
  address: string
  vaultCap: {
    used: number
    max: number
  }
}
