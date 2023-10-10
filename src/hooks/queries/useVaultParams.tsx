import { useQuery } from '@tanstack/react-query'
import { iterateContractQuery } from 'functions'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export const useVaultParams = () => {
  const paramsClient = useStore((s) => s.paramsClient)

  return useQuery(
    [QUERY_KEYS.VAULT_PARAMS],
    async () => {
      if (!paramsClient) return []
      return await iterateContractQuery(paramsClient.allVaultConfigs)
    },
    {
      enabled: !!paramsClient,
      initialData: [],
    },
  )
}
