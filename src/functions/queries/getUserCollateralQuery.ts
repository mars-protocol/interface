export const getUserCollateralQuery = (address: string) => {
  return `{
                user_collaterals: {
                    user: "${address}"
                }
            }`
}
