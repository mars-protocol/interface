import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

const QUERY_LIMIT = 10

export const useUserCollaterals = () => {
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const redbankContractAddress = useStore((s) => s.networkConfig.contracts.redBank)
  const client = useStore((s) => s.client)

  const resolveUserDeposits = (collaterals: UserCollateral[]): Coin[] => {
    return collaterals.map((collateral) => {
      return {
        denom: collateral.denom,
        amount: collateral.amount,
      }
    })
  }

  const getCollaterals = async (
    contract: string,
    startAfter?: string,
  ): Promise<UserCollateral[]> => {
    if (!client) return []
    return client.cosmWasmClient.queryContractSmart(contract, {
      user_collaterals: {
        user: userWalletAddress,
        limit: QUERY_LIMIT,
        start_after: startAfter,
      },
    })
  }

  useQuery<UserCollateral[]>(
    [QUERY_KEYS.USER_COLLATERAL],
    async () => {
      let userCollateral: UserCollateral[] = []
      if (!redbankContractAddress) return userCollateral

      let isMoreCollaterals = true

      while (isMoreCollaterals) {
        const collateral = await getCollaterals(
          redbankContractAddress,
          userCollateral[userCollateral.length - 1]?.denom || '',
        )
        userCollateral = userCollateral.concat(collateral)

        if (collateral.length < QUERY_LIMIT) isMoreCollaterals = false
      }

      const userDeposits: Coin[] = resolveUserDeposits(userCollateral)
      useStore.setState({ userCollateral: userCollateral, userDeposits: userDeposits })
      return userCollateral
    },
    {
      enabled: !!redbankContractAddress && !!userWalletAddress && !!client,
      staleTime: 30000,
      refetchInterval: 30000,
    },
  )
}
