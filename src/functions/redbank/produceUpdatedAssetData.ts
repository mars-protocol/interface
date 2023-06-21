import { demagnify } from 'libs/parse'
import { ViewType } from 'types/enums'

export const produceUpdatedAssetData = (
  redBankAssets: RedBankAsset[],
  assetData: RedBankAsset[],
  denom: string,
  updateAmount: number,
  activeView: ViewType,
  key: 'depositBalanceBaseCurrency' | 'borrowBalanceBaseCurrency',
  baseCurrencyDecimals: number,
) => {
  const alreadyPresent = assetData.some((asset: RedBankAsset) => asset.denom === denom)
  // For first use, when the user has no borrow balance yet and this list will be empty
  if (!alreadyPresent) {
    const asset = redBankAssets.find((redBankAsset) => redBankAsset.denom === denom)
    if (!asset) return assetData

    const amountAdjustedForDecimals = updateAmount
    // We are only interested in display currency balance. The asset  will update post tx.
    assetData.push({
      ...asset,
      [key]: amountAdjustedForDecimals,
    })
    return assetData
  }

  return assetData.map((asset) => {
    const additionalDecimals = asset.decimals - baseCurrencyDecimals
    const amountAdjustedForDecimals = demagnify(updateAmount, additionalDecimals)
    const newAsset = { ...asset }
    const assetbaseCurrencyBalance = asset[key] || 0
    let updatedAssetbaseCurrencyBalance = asset[key]
    if (asset.denom === denom) {
      // if we are borrowing or depositing, make the balance increase by the amount.
      // if we are repaaying or redeeming, we decrease the amount
      updatedAssetbaseCurrencyBalance =
        activeView === ViewType.Borrow || activeView === ViewType.Deposit
          ? assetbaseCurrencyBalance + amountAdjustedForDecimals
          : assetbaseCurrencyBalance - amountAdjustedForDecimals
    }
    newAsset[key] = updatedAssetbaseCurrencyBalance
    return newAsset
  })
}
