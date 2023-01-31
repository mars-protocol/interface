import { useQuery } from '@tanstack/react-query'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'
import { Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

interface Props {
  coins: Coin[]
  vault: Vault
}

export const useProvideLiquidity = (props: Props) => {
  const creditManagerClient = useStore((s) => s.creditManagerClient)

  return useQuery(
    [QUERY_KEYS.PROVIDE_LIQUIDITY, props.coins],
    async () => {
      if (!creditManagerClient || !props.coins.length) return null
      return creditManagerClient.estimateProvideLiquidity({
        coinsIn: props.coins,
        lpTokenOut: props.vault?.denoms.lpToken || '',
      })
    },
    {
      enabled:
        !!creditManagerClient &&
        props.coins.every((coin) => Number(coin.amount) > 0) &&
        !!props.vault,
    },
  )
}
