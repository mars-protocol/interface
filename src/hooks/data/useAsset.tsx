import useStore from 'store'

interface Props {
  denom?: string
  symbol?: string
}

export const useAsset = (props: Props) => {
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)
  const otherAssets = useStore((s) => s.otherAssets)
  const assets = [...whitelistedAssets, ...otherAssets]

  if (props.denom) {
    return assets.find((asset) => asset.denom === props.denom)
  } else {
    return assets.find((asset) => asset.symbol === props.symbol)
  }
}
