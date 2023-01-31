export const getIncentiveQuery = (denom: string) => {
  return `{
                asset_incentive: {
                    denom: "${denom}"
                }
            }`
}
