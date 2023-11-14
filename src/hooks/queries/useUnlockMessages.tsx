import { useQuery } from '@tanstack/react-query'
import { getTokenValueFromCoins } from 'functions/fields'
import { formatUnlockDate } from 'libs/parse'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { VaultClient } from 'types/classes'
import { QUERY_KEYS } from 'types/enums/queryKeys'

interface Props {
  vault?: ActiveVault
  vaultTokenAmount: string
}

export const useUnlockMessages = (props: Props) => {
  const { t } = useTranslation()
  const client = useStore((s) => s.client)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const creditManagerClient = useStore((s) => s.creditManagerClient)
  const whitelistedAssets = useStore((s) => s.networkConfig.assets.whitelist)

  return useQuery<FieldsAction[] | null>(
    [QUERY_KEYS.UNLOCK_MESSAGE],
    async () => {
      if (!client || !userWalletAddress || !props.vault || !creditManagerClient) return null

      const vaultClient = new VaultClient(props.vault.address, client)
      const lpTokenAmount = await vaultClient.query({
        preview_redeem: {
          amount: props.vaultTokenAmount,
        },
      })

      const lpToken = { denom: props.vault.denoms.lpToken, amount: lpTokenAmount }

      const coins = await creditManagerClient.query({
        estimate_withdraw_liquidity: {
          lp_token: lpToken,
        },
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
