import { useQuery } from '@tanstack/react-query'
import { iterateContractQuery } from 'functions'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'

export const useAssetParams = () => {
  const paramsContract = useStore((s) => s.networkConfig.contracts.params)
  const paramsClient = useStore((s) => s.paramsClient)
  const whitelistedAssets = useStore((s) => s.networkConfig.assets.whitelist)
  return useQuery(
    [QUERY_KEYS.ASSET_PARAMS],
    async () => {
      if (!paramsClient) return []

      const params = await iterateContractQuery(paramsClient.allAssetParams)
      const capQueries = whitelistedAssets.map(
        async (assetParams) => await paramsClient.totalDeposit({ denom: assetParams.denom }),
      )
      const assetCaps = await Promise.all(capQueries)
      assetCaps.forEach((assetCap) => {
        const assetParams = params.find((param) => param.denom === assetCap.denom)
        if (!assetParams) return
        assetParams.cap = { amount: assetCap.cap, used: assetCap.amount }
      })
      useStore.setState({ assetParams: params })
      return params
    },
    {
      enabled: (!!paramsContract && !!paramsClient) || !paramsContract,
    },
  )
}
