import { Denom } from '@terra-money/terra.js'
import { MarketQuery, UserAssetCollateral } from '../hooks/useRedBank'
import { DEFAULT_SLIPPAGE } from '../constants/appConstants'

export const producePercentData = (gridData: AssetInfo[]): number[] => {
    // we need to return the percentage value each item represents, not the raw
    const balances = gridData.map((asset: AssetInfo) => asset.uusdBalance || 0)
    const sum = balances.reduce((a, b) => Number(a) + Number(b), 0)

    return gridData.map((asset: AssetInfo) => {
        // protect from divide by 0 errors
        if (sum === 0) return 0

        return Number(((Number(asset.uusdBalance) / sum) * 100).toFixed(2))
    })
}

export const ltvWeightedDepositValue = (
    assetData: AssetInfo[],
    findMarketInfo: (key: Denom) => MarketQuery | undefined,
    findUserAssetCollateral: (key: Denom) => UserAssetCollateral | undefined,
    // This is used to emulate SC state when a new asset is used. Collateral should be enabled in this case
    enableCollateralForAssetDenom?: string
) => {
    return (
        assetData.reduce(
            (total, asset) =>
                total +
                (findUserAssetCollateral(asset.denom)?.enabled ||
                asset.denom === enableCollateralForAssetDenom
                    ? (asset.uusdBalance || 0) *
                      (findMarketInfo(asset.denom || '')?.max_loan_to_value ||
                          0)
                    : 0),
            0
        ) *
        (1 - DEFAULT_SLIPPAGE)
    )
    // DEFAULT_SLIPPAGE is for differences in exchange rates for collateral between the time of broadcasting a tx vs the time a validator will execvute the tx
}

export const maintainanceMarginWeightedDepositValue = (
    assetData: AssetInfo[],
    findMarketInfo: (key: Denom) => MarketQuery | undefined,
    findUserAssetCollateral: (key: Denom) => UserAssetCollateral | undefined,
    // This is used to emulate SC state when a new asset is used. Collateral should be enabled in this case
    enableCollateralForAssetDenom?: string
) => {
    return assetData.reduce(
        (total, asset) =>
            total +
            (findUserAssetCollateral(asset.denom)?.enabled ||
            asset.denom === enableCollateralForAssetDenom
                ? (asset.uusdBalance || 0) *
                  (findMarketInfo(asset.denom || '')?.liquidation_threshold ||
                      0)
                : 0),
        0
    )
}

export const balanceSum = (gridData: AssetInfo[]): number => {
    return gridData.reduce(
        (total, asset: AssetInfo) => total + (asset.uusdBalance || 0),
        0
    )
}

export const getMaTokenAddress = (
    whitelist: MaTokenContracts | undefined,
    denom: string
): string => {
    if (whitelist) {
        for (const whitelistToken in whitelist) {
            if (whitelist[whitelistToken].denom === denom) {
                return whitelistToken
            }
        }
    }
    return ''
}
