import { useQuery } from '@tanstack/react-query'
import { getTokenValueFromCoins } from 'functions/fields'
import { formatUnlockDate } from 'libs/parse'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'
import { MarsMockVaultClient } from 'types/generated/mars-mock-vault/MarsMockVault.client'

interface Props {
  vault?: ActiveVault
  vaultTokenAmount: string
}

export const useUnlockMessages = (props: Props) => {
  const { t } = useTranslation()
  const client = useStore((s) => s.client)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const creditManagerClient = useStore((s) => s.creditManagerClient)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)

  return useQuery<FieldsAction[] | null>(
    [QUERY_KEYS.UNLOCK_MESSAGE],
    async () => {
      if (!client || !userWalletAddress || !props.vault || !creditManagerClient) return null

      const vaultClient = new MarsMockVaultClient(client, userWalletAddress, props.vault.address)
      const lpTokenAmount = await vaultClient.previewRedeem({
        amount: props.vaultTokenAmount,
      })

      const lpToken = { denom: props.vault.denoms.lpToken, amount: lpTokenAmount }

      const coins = await creditManagerClient.estimateWithdrawLiquidity({
        lpToken,
      })

      return [
        {
          label: t('fields.actions.unlocking'),
          values: getTokenValueFromCoins(whitelistedAssets, coins),
        },
        {
          label: t('fields.unlocksAt'),
          values: [formatUnlockDate(new Date().getTime(), props.vault.lockup)],
        },
      ]
    },
    {
      enabled:
        !!client &&
        !!userWalletAddress &&
        !!props.vault &&
        !!props.vaultTokenAmount &&
        !!creditManagerClient,
    },
  )
}
