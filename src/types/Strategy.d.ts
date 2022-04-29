interface FieldsStrategy {
    key: string
    minter: string
    color: string
    contract_addr: string
    name?: string
    logo: string
    borrow: string
    description?: string
    assets: WhitelistAsset[]
    apr?: StrategyRate
    apy?: StrategyRate
    apyQuery?: StrategyApyQuery
    astroportGenerator: string
    lpToken: string
    maxLeverage: number
    isPrimaryInWallet?: boolean
    provider: StrategyProvider
    externalLink?: string
}

interface StrategyRate {
    trading: number
    astro: number
    protocol: number
    total: number
    leverage: number
}

interface StrategyConfig {
    bonus_rate: string
    fee_rate: string
    governance: string
    max_ltv: string
    oracle: { contract_addr: string }
    primary_pair: {
        contract_addr: string
        liquidity_token: string
    }
    primary_asset_info: AssetInfo
    red_bank: {
        contract_addr: string
    }
    secondary_asset_info: AssetInfo
    staking: {
        mars: {
            contract_addr: string
        }
        asset_token: string
        staking_token: string
    }
    treasury: string
}

interface StrategyState {
    total_bond_value: string
    total_bond_units: string
    total_debt_value: string
    total_debt_units: string
    ltv: string | null
}

interface StrategySnapshot {
    time: string
    height: string
    health: StrategyHealth
    position: StrategyPosition
}

interface StrategyPosition {
    bond_units: string
    debt_units: string
    decimals?: number
    apy?: number
    poolApr?: number
    trueApy?: number
    pnl?: number
    leverage?: number
    daily_return?: number
    net_worth?: number
    liquidation_price?: number
    denom?: string
    primarySupplyUnits?: number
    primarySupplyRatio?: number
    secondarySupplyUnits?: number
    secondarySupplyRatio?: number
    primaryAssetAvailable?: number
    secondaryAssetAvailable?: number
}

interface StrategyHealth {
    bond_value: string
    debt_value: string
    ltv: string
}

interface StrategyObject extends FieldsStrategy, StrategyConfig {
    primaryAssetIndex: number
    position: StrategyPosition | undefined
    health: StrategyHealth | undefined
    snapshot: StrategySnapshot
    pool_info: PoolInfo | undefined
    minter_address: string | undefined
    secondarySupplyRatio: number | undefined
    primarySupplyRatio: number | undefined
    bondedShares: string
    total_bond_units: string
    uncollaterisedLoanLimit: number
    strategyTotalDebt: string
    bond_value: string
}

interface UnlockedAssets {
    primaryAssetUnlocked: number
    secondaryAssetUnlocked: number
}

interface FieldsState {
    strategies: StrategyObject[] | undefined
    netWorth: number
    refetch: () => void
    calculateUnlock: (
        bondUnits: number,
        strategy: StrategyObject
    ) => UnlockedAssets
}

interface StrategyApyQuery {
    url: string
    query?: string
    target: (string | number)[]
    apr: boolean
    absolute: boolean
}

interface StrategyAmounts {
    primary: number
    secondary: number
    debt: number
}

interface StrategyBarItem {
    name: string
    color: string
    value: number
}

interface StrategyBarProps {
    title: string
    value: number
    total: number
    bars: StrategyBarItem[]
    compactView?: boolean
}

interface MinterInfo {
    cap?: string
    minter: string
}

interface PoolAsset {
    amount: string
    info: AssetInfo
}

interface PoolInfo {
    assets: PoolAsset[]
    total_share: string
}
