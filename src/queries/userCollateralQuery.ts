export const userCollateralQuery = (address: string) => {
    return `{
                user_collateral: {
                    user_address: "${address}"
                }
            }`
}
