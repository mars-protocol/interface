import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import useStore from 'store'
import { State } from 'types/enums'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export interface MarsOracleData {
  prices: {
    [key: string]: {
      denom: string
      price: string
    }
  }
}

export const useMarsOracle = () => {
  const hiveUrl = useStore((s) => s.networkConfig?.hiveUrl)
  const oracleAddress = useStore((s) => s.networkConfig?.contracts.oracle)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets) || []
  const processMarsOracleQuery = useStore((s) => s.processMarsOracleQuery)
  const setExchangeRatesState = useStore((s) => s.setExchangeRatesState)

  let queries = ``

  whitelistedAssets
    .filter((asset: Asset) => !!asset.denom)
    .forEach((whitelistAsset) => {
      const denom = whitelistAsset.denom

      const asset = `{
                    denom: "${denom}"
                }`

      const querySegment = `
                    ${whitelistAsset.id}: contractQuery(contractAddress: "${oracleAddress}", query: {
                        price: ${asset}
                    })
                `
      queries = queries + querySegment
    })

  useQuery<MarsOracleData>(
    [QUERY_KEYS.MARS_ORACLE],
    async () => {
      return await request(
        hiveUrl!,
        gql`
                    query MarsOracle {
                     prices: wasm {
                         ${queries}
                     }
                    }
                `,
      )
    },
    {
      enabled: !!hiveUrl && !!oracleAddress,
      staleTime: 30000,
      refetchInterval: 30000,
      onError: () => setExchangeRatesState(State.ERROR),
      onSuccess: processMarsOracleQuery,
    },
  )
}
