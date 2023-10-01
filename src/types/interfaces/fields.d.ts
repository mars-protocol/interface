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

interface AprResponse {
  vaults: AprVault[]
}

interface AprVault {
  chain: string
  address: string
  apr: AprBreakdown
}

interface AprBreakdown {
  start_timestamp: number
  end_timestamp: number
  period_diff: number
  start_vault_token_price: number
  end_vault_token_price: number
  period_yield: number
  period_daily_return: number
  projected_apr: number
}

interface ApyBreakdown {
  vaultAddress: string
  total: number | null
}

interface VaultCapData {
  address: string
  vaultCap: {
    denom: string
    used: number
    max: number
  }
}
