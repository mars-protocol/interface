interface Assets {
    [key: string]: WhitelistAsset
}

interface AssetInfo {
    denom: string
    decimals: number
    asset?: ReactNode
    apy?: number
    balance?: string
    uusdBalance?: number
    liquidity?: string
    uusdLiquidity?: number
    symbol?: string
    name?: string
    logo?: string
    incomeOrExpense?: number
    wallet?: string
    uusdWallet?: number
    color?: string
    maToken?: string
    incentive?: AssetInfo
}
