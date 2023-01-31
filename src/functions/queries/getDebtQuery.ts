export const getDebtQuery = (address: string) => {
  return `
    {
        user_debts: { user: "${address}" }
    }`
}
1
