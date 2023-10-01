import {
  NETWORK_CONFIG as osmosisDevnetConfig,
  VAULT_CONFIGS as osmosisDevnetVaultConfig,
} from '../configs/devnet'
import {
  NETWORK_CONFIG as neutronMainnetConfig,
  VAULT_CONFIGS as neutronMainnetVaultConfig,
} from '../configs/neutron-1'
import {
  NETWORK_CONFIG as osmosisMainnetConfig,
  VAULT_CONFIGS as osmosisMainnetVaultConfig,
} from '../configs/osmosis-1'
import {
  NETWORK_CONFIG as neutronTestnetConfig,
  VAULT_CONFIGS as neutronTestnetVaultConfig,
} from '../configs/pion-1'

export const getNetworkConfig = (network: string): NetworkConfig => {
  let networkConfig

  switch (network) {
    case 'neutron-1':
      networkConfig = neutronMainnetConfig
      break

    case 'devnet':
      networkConfig = osmosisDevnetConfig
      break

    case 'pion-1':
      networkConfig = neutronTestnetConfig
      break

    default:
      networkConfig = osmosisMainnetConfig
  }

  return networkConfig
}

export const getNetworkVaultConfig = (network: string): Vault[] => {
  let vaultConfig

  switch (network) {
    case 'neutron-1':
      vaultConfig = neutronMainnetVaultConfig
      break

    case 'devnet':
      vaultConfig = osmosisDevnetVaultConfig
      break

    case 'pion-1':
      vaultConfig = neutronTestnetVaultConfig
      break

    default:
      vaultConfig = osmosisMainnetVaultConfig
  }

  return vaultConfig
}
