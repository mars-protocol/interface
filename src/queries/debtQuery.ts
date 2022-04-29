export const debtQuery = (address: string) => {
    return `
    {
        user_debt: { user_address: "${address}" }
    }`
}
