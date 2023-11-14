import useStore from 'store'

interface Props {
  denom?: string
  symbol?: string
}

export const useAsset = (props: Props) => {
  const whitelistedAssets = useStore((s) => s.networkConfig.assets.whitelist)
  const otherAssets = useStore((s) => s.networkConfig.assets.other)
  const assets = [...whitelistedAssets, ...otherAssets]

  if (props.denom) {
    return assets.find((asset) => asset.denom === props.denom)
  } else {
    return assets.find((asset) => asset.symbol === props.symbol)
  }
}
