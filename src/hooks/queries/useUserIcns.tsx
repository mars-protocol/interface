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
  const hiveUrl = 'https://osmosis-mars-frontend.simply-vc.com.mt/GGSFGSFGFG34/osmosis-hive/graphql'
  const resolverContract = 'osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd'

  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const setUserIcns = useStore((s) => s.setUserIcns)

  const result = useQuery<UserIcnsData>(
    [QUERY_KEYS.USER_ICNS],
    async () => {
      return await request(
        hiveUrl!,
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
      enabled: !!userWalletAddress || false,
      onSuccess: (data) => {
        const icns = data.wasm.contractQuery.primary_name
        if (icns !== '') setUserIcns(icns)
      },
    },
  )

  return {
    ...result,
    data: useMemo(() => result.data, [result.data]),
  }
}
