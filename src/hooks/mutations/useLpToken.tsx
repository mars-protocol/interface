import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useMutation } from '@tanstack/react-query'
import { MarsMockVaultClient } from 'types/generated/mars-mock-vault/MarsMockVault.client'

interface Props {
  vault: Vault
  vaultTokenAmount: string
  client: SigningCosmWasmClient
  userWalletAddress: string
}

export const useLpToken = () => {
  return useMutation(async (props: Props) => {
    if (!props.client || !props.vaultTokenAmount || !props.vault || !props.userWalletAddress)
      return null
    const vaultClient = new MarsMockVaultClient(
      props.client,
      props.userWalletAddress,
      props.vault.address,
    )

    return vaultClient.previewRedeem({
      amount: props.vaultTokenAmount,
    })
  })
}
