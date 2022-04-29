export const nativeMarketQuery = (denom: string) => {
    // Load market info

    return `
        {
            market: {
                asset: {
                    native: {
                        denom: "${denom}"
                    }
                }
            }
        }`
}

export const cw20MarketQuery = (contractAddress: string) => {
    return `                   
         {
            market: {
                asset: {
                    cw20: {
                        contract_addr: "${contractAddress}"
                    }
                }
            }
        }
    `
}
