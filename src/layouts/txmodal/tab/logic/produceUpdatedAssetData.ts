import { ViewType } from '../../../../types/enums'

export const produceUpdatedAssetData = (
    assetData: AssetInfo[],
    denom: string,
    decimals: number,
    updateAmount: number,
    activeView: ViewType
) => {
    const alreadyPresent = assetData.some(
        (asset: AssetInfo) => asset.denom === denom
    )
    // For first use, when the user has no borrow balance yet and this list will be empty
    if (!alreadyPresent) {
        // We are only interested in UUSD balance. The asset  will update post tx.
        assetData.push({
            uusdBalance: updateAmount,
            symbol: denom,
            denom,
            decimals,
        })
        return assetData
    }

    return assetData.map((asset) => {
        let newAsset = { ...asset }
        const assetUusdBalance = asset.uusdBalance || 0
        let updatedAssetUusdBalance = asset.uusdBalance
        if (asset.denom === denom) {
            // if we are borrowing or depositing, make the usd balance increase by the usd amount.
            // if we are repaaying or redeeming, we decrease the usd amount
            updatedAssetUusdBalance =
                activeView === ViewType.Borrow ||
                activeView === ViewType.Deposit
                    ? assetUusdBalance + updateAmount
                    : assetUusdBalance - updateAmount
        }
        newAsset.uusdBalance = updatedAssetUusdBalance
        return newAsset
    })
}
