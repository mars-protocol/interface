import { DEFAULT_SLIPPAGE } from 'constants/appConstants'
import { findByDenom } from 'functions'

export const producePercentData = (
  gridData: RedBankAsset[],
  key: 'borrowBalanceBaseCurrency' | 'depositBalanceBaseCurrency',
): number[] => {
  // we need to return the percentage value each item represents, not the raw
  const balances = gridData.map((asset: RedBankAsset) => asset[key] || 0)
  const sum = balances.reduce((a, b) => Number(a) + Number(b), 0)

  return gridData.map((asset: RedBankAsset) => {
    // protect from divide by 0 errors
    if (sum === 0) return 0

    return Number(((Number(asset[key]) / sum) * 100).toFixed(2))
  })
}

export const ltvWeightedDepositValue = (
  assetData: RedBankAsset[],
  marketInfo: Market[],
  userCollateral: UserCollateral[],
  key: 'borrowBalanceBaseCurrency' | 'depositBalanceBaseCurrency',
  // This is used to emulate SC state when a new asset is used. Collateral should be enabled in this case
  enableCollateralForAssetDenom?: string,
) => {
  return (
    assetData.reduce((total, asset) => {
      return (
        total +
        ((findByDenom(userCollateral, asset.denom) as UserCollateral)?.enabled ||
        asset.denom === enableCollateralForAssetDenom
          ? (asset[key] || 0) * (findByDenom(marketInfo, asset.denom || '')?.max_loan_to_value || 0)
          : 0)
      )
    }, 0) *
    (1 - DEFAULT_SLIPPAGE)
  )
  // DEFAULT_SLIPPAGE is for differences in exchange rates for collateral between the time of broadcasting a tx vs the time a validator will execvute the tx
}

export const maintainanceMarginWeightedDepositValue = (
  assetData: RedBankAsset[],
  marketInfo: Market[],
  userCollateral: UserCollateral[],
  key: 'borrowBalanceBaseCurrency' | 'depositBalanceBaseCurrency',
  // This is used to emulate SC state when a new asset is used. Collateral should be enabled in this case
  enableCollateralForAssetDenom?: string,
) => {
  return assetData.reduce(
    (total, asset) =>
      total +
      ((findByDenom(userCollateral || [], asset.denom) as UserCollateral)?.enabled ||
      asset.denom === enableCollateralForAssetDenom
        ? (asset[key] || 0) *
          (findByDenom(marketInfo, asset.denom || '')?.liquidation_threshold || 0)
        : 0),
    0,
  )
}

export const balanceSum = (
  assets: RedBankAsset[],
  key: 'borrowBalanceBaseCurrency' | 'depositBalanceBaseCurrency',
): number => {
  return assets.reduce((acc, asset: RedBankAsset) => acc + (asset[key] || 0), 0)
}
