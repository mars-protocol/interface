export const balanceQuery = (address: string) => {
    return `{
                balance: { address: "${address}" }
            }`
}
