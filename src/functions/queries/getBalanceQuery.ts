export const getBalanceQuery = (address: string) => {
  return `{
                balance: { address: "${address}" }
            }`
}
