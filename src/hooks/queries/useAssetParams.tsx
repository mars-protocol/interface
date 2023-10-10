import { useQuery } from '@tanstack/react-query'
import { iterateContractQuery } from 'functions'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export const useAssetParams = () => {
  const paramsContract = useStore((s) => s.networkConfig.contracts.params)
  const paramsClient = useStore((s) => s.paramsClient)

  return useQuery(
    [QUERY_KEYS.ASSET_PARAMS],
    async () => {
      if (!paramsClient) return []

      const params = await iterateContractQuery(paramsClient.allAssetParams)
      useStore.setState({ assetParams: params })
      return params
    },
    {
      enabled: (!!paramsContract && !!paramsClient) || !paramsContract,
    },
  )
}
