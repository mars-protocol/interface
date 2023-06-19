import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import { useMemo } from 'react'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export interface UserIcnsData {
  wasm: {
    contractQuery: {
      names: string[]
      primary_name: string
    }
  }
}

export const useUserIcns = () => {
  /* only possible to query on mainnet */
  const resolverContract = 'osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd'
  const networkConfig = useStore((s) => s.networkConfig)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const hiveUrl = networkConfig.hiveUrl

  const result = useQuery<UserIcnsData>(
    [QUERY_KEYS.USER_ICNS],
    async () => {
      return await request(
        hiveUrl,
        gql`
        query UserIcnsQuery {
          wasm {
            contractQuery(contractAddress:"${resolverContract}", query: {
              icns_names:{
                address: "${userWalletAddress}"
              }
            })
          }
        }`,
      )
    },
    {
      enabled: !!userWalletAddress,
      onSuccess: (data) => {
        const userIcns = data.wasm.contractQuery.primary_name
        if (userIcns !== '') useStore.setState({ userIcns })
      },
    },
  )

  return {
    ...result,
    data: useMemo(() => result.data, [result.data]),
  }
}
