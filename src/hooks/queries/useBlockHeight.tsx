import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

interface TaxData {
  taxRate: string
  taxCap: {
    amount: string
  }
}

export interface BlockHeightData {
  treasury: TaxData
  tendermint: {
    blockInfo: {
      block: {
        header: {
          height: number
        }
      }
    }
  }
}

export const useBlockHeight = () => {
  const hiveUrl = useStore((s) => s.networkConfig?.hiveUrl)
  const processBlockHeightQuery = useStore((s) => s.processBlockHeightQuery)
  useQuery<BlockHeightData>(
    [QUERY_KEYS.BLOCK_HEIGHT],
    async () => {
      return await request(
        hiveUrl!,
        gql`
          query BlockHeightQuery {
            tendermint {
              blockInfo {
                block {
                  header {
                    height
                  }
                }
              }
            }
          }
        `,
      )
    },
    {
      enabled: !!hiveUrl,
      refetchInterval: 120000,
      onSuccess: processBlockHeightQuery,
    },
  )
}
