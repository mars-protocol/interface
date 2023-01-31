import useStore from 'store'

export const useRedBankAsset = (denom: string) => {
  const redBankAssets = useStore((s) => s.redBankAssets)
  return redBankAssets.find((asset) => asset.denom === denom)
}
