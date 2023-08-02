export const getIncentiveQuery = (denom: string, hasMultiAssetIncentives: boolean) => {
  const queryMethod = hasMultiAssetIncentives ? 'active_emissions' : 'asset_incentive'
  const queryKey = hasMultiAssetIncentives ? 'collateral_denom' : 'denom'

  return `{
                ${queryMethod}: {
                    ${queryKey}: "${denom}"
                }
            }`
}
