export const incentiveQuery = (maTokenAddress: string) => {
    return `{
                asset_incentive: {
                    ma_token_address: "${maTokenAddress}"
                }
            }`
}
