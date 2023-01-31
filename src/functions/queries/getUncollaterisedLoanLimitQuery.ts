export const getUncollaterisedLoanLimitQuery = (userAddress: string, denom: string) => {
  return `{
                uncollateralized_loan_limit: {
                    user_address: "${userAddress}",
                            denom: "${denom}"
                }  
            }`
}
