interface ActiveVault extends Vault {
  position: Position
}

interface Vault {
  address: string
  name: {
    name: string
    unlockDuration: number
    unlockTimeframe: string
  }
  description: {
    maxLeverage: number
    lpName: string
  }
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
  apy: ApyBreakdown
}

interface Position {
  id?: number
  status: 'active' | 'unlocking' | 'unlocked'
  accountId: string
  amounts: {
    primary: number
    secondary: number
    borrowedPrimary: number
    borrowedSecondary: number
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
    borrowedPrimary: number
    borrowedSecondary: number
    total: number
    net: number
  }
  apy: PositionApyBreakdown
  ltv: number
  currentLeverage: number
  unlockAtTimestamp?: number
  borrowDenom: string | null
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
  accountId: string
}

interface VaultCoinsWithAddress {
  coins: Coin[]
  vaultAddress: string
  accountId: string
}

interface UnlockTimeWithAddress {
  unlockAtTimestamp: number
  vaultAddress: string
  accountId: string
}

interface FieldsAction {
  label: string
  values: string[]
}

interface PositionApyBreakdown extends ApyBreakdown {
  borrow: number
  net: number | null
}

interface ApyBreakdown {
  vaultAddress: string
  apys: { type: string; value: number }[] | null
  fees: { type: string; value: number }[] | null
  total: number | null
}

interface ApolloAprResponse {
  contract_address: string
  apr: AprBreakdown
}

interface AprBreakdown {
  aprs: { type: string; value: number }[]
  fees: { type: string; value: string | number }[]
}

interface VaultCapData {
  address: string
  vaultCap: {
    denom: string
    used: number
    max: number
  }
}
