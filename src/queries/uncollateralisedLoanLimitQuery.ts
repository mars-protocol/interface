export const uncollaterisedNativeLoanLimitQuery = (
    userAddress: string,
    denom: string
) => {
    return `{
                uncollateralized_loan_limit: {
                    user_address: "${userAddress}",
                    asset: { 
                        native: {
                            denom: "${denom}"
                        }
                    }
                }  
            }`
}

export const uncollaterisedLoanLimitQuery = (
    userAddress: string,
    assetAddress: string
) => {
    return `{
                uncollateralized_loan_limit: {
                    user_address: "${userAddress}",
                    asset: { 
                        cw20: {
                            contract_addr: "${assetAddress}"
                        }
                    }
                }
            }`
}
