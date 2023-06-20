import { useQuery } from '@tanstack/react-query'
import { getContractQuery } from 'functions/queries'
import { gql, request } from 'graphql-request'
import useStore from 'store'
import { State } from 'types/enums'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export const useMarsOracle = () => {
  const hiveUrl = useStore((s) => s.networkConfig.hiveUrl)
  const oracleAddress = useStore((s) => s.networkConfig.contracts.oracle)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets) || []
  const basePriceState = useStore((s) => s.basePriceState)
  const processMarsOracleQuery = useStore((s) => s.processMarsOracleQuery)
  const setExchangeRatesState = useStore((s) => s.setExchangeRatesState)

  let priceQueries = ``
  const configQuery = getContractQuery('config', oracleAddress || '', '{ config: {} }')
  const priceSourcesQuery = getContractQuery(
    'price_sources',
    oracleAddress || '',
    '{ price_sources: {limit: 20} }',
  )

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
      priceQueries = priceQueries + querySegment
    })

  useQuery<OracleData>(
    [QUERY_KEYS.MARS_ORACLE],
    async () => {
      return await request(
        hiveUrl!,
        gql`
          query MarsOracle {
            oracle: wasm {
              ${configQuery}
            }, 
            sources: wasm {
              ${priceSourcesQuery}
            }, 
            prices: wasm {
                ${priceQueries}
            }
          }
        `,
      )
    },
    {
      enabled: !!hiveUrl && !!oracleAddress && basePriceState === State.READY,
      staleTime: 30000,
      refetchInterval: 30000,
      onError: () => setExchangeRatesState(State.ERROR),
      onSuccess: processMarsOracleQuery,
    },
  )
}
