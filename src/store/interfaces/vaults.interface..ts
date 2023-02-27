import { Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export interface VaultsSlice {
  isLoading: boolean
  availableVaults: Vault[]
  activeVaults: ActiveVault[]
  creditAccounts?: Positions[]
  addAprToVaults: (aprs: AprData[]) => void
  getCreditAccounts: (options?: Options) => Promise<Positions[]>
  vaultAssets?: VaultCoinsWithAddress[]
  getVaultAssets: (options?: Options) => Promise<VaultCoinsWithAddress[]>
  unlockTimes?: UnlockTimeWithAddress[]
  getUnlockTimes: (options?: Options) => Promise<UnlockTimeWithAddress[]>
  aprs?: AprData[] | null
  getAprs: (options?: Options) => Promise<null>
  caps?: VaultCapData[]
  getCaps: (options?: Options) => Promise<VaultCapData[]>
  lpTokens?: LpTokenWithAddress[]
  getLpTokens: (options?: Options) => Promise<LpTokenWithAddress[]>
  getVaults: (options?: Options) => Promise<void>
}

export interface Options {
  refetch: boolean
}
