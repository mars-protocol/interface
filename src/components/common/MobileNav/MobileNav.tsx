import classNames from 'classnames'
import { SVG } from 'components/common'
import { getCouncilLink } from 'libs/council'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'

import styles from './MobileNav.module.scss'

export const MobileNav = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const client = useStore((s) => s.client)
  const networkConfig = useStore((s) => s.networkConfig)
  const currentNetwork = useStore((s) => s.currentNetwork)

  return (
    <nav className={styles.mobileNav}>
      <Link
        href='/redbank'
        passHref
        className={classNames(styles.nav, !router.pathname.includes('farm') && styles.active)}
      >
        <div className={classNames(styles.icon, styles.redBank)} />
        <span>{t('global.redBank')}</span>
      </Link>

      <a
        className={styles.nav}
        target='_blank'
        href={getCouncilLink(currentNetwork, client?.connectedWallet.providerId as WalletID)}
        rel='noreferrer'
      >
        <div className={styles.icon}>
          <SVG.CouncilIcon />
        </div>
        <span>{t('global.council')}</span>
      </a>
      {networkConfig.isFieldsEnabled && (
        <Link
          href='/farm'
          passHref
          className={classNames(styles.nav, router.pathname.includes('farm') && styles.active)}
        >
          <div className={classNames(styles.icon, styles.farm)} />
          <span>{t('global.fields')}</span>
        </Link>
      )}
    </nav>
  )
}
