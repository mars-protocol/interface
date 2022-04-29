export const bankQuery = (address: string) => {
    return `
        balance: bank {
            balance(address: "${address}") {
                amount
                denom
            }
        }
    `
}
