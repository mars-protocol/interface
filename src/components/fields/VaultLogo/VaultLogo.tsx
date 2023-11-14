import Image from 'next/image'
import useStore from 'store'

import styles from './VaultLogo.module.scss'

interface Props {
  vault: Vault | ActiveVault
}

export const VaultLogo = ({ vault }: Props) => {
  const whitelistedAssets = useStore((s) => s.networkConfig.assets.whitelist)

  const primaryAsset = whitelistedAssets.find((asset) => asset.denom === vault.denoms.primary)
  const secondaryAsset = whitelistedAssets.find((asset) => asset.denom === vault.denoms.secondary)
  if (!secondaryAsset || !primaryAsset) return null

  return (
    <>
      <div className={styles.primary}>
        <Image alt='logo' height={24} src={primaryAsset.logo} width={24} />
      </div>
      <div className={styles.secondary}>
        <Image alt='logo' height={24} src={secondaryAsset.logo} width={24} />
      </div>
    </>
  )
}
