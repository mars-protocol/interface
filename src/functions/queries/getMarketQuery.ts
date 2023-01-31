export const getMarketQuery = (denom: string) => {
  return `
        {
            market: {
                denom: "${denom}"
            }
        }`
}
