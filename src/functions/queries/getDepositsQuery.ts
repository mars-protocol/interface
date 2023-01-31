export const getDepositsQuery = (address: string) => {
  return `
    {
        user_collaterals: { user: "${address}" }
    }`
}
