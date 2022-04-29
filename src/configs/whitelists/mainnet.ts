import Assets from '../assets/mainnet'

const nativeAssetWhitelist: WhitelistAsset[] = [Assets.luna, Assets.ust]

const cw20AssetWhitelist: WhitelistAsset[] = [Assets.anc]

// These assets are supported by the red bank and should use the Mars oracle
export const Whitelist: WhitelistAsset[] = [
    ...nativeAssetWhitelist,
    ...cw20AssetWhitelist,
]

// These assets are not supported by red bank but will be displayed in the app where they need an exchange rate
export const Other: OtherAsset[] = [Assets.mars, Assets.astro, Assets.mir]
