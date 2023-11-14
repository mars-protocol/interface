import classNames from 'classnames'
import { IncentivesButton, Settings, SVG, Wallet } from 'components/common'
import { getCouncilLink } from 'libs/council'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'

import { ChainSelect } from './ChainSelect'
import styles from './Header.module.scss'

export const Header = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const client = useStore((s) => s.client)
  const networkConfig = useStore((s) => s.networkConfig)
  const currentNetwork = useStore((s) => s.currentNetwork)

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <SVG.Logo />
      </div>
      <div className={styles.navbar}>
        <Link
          passHref
          href='/redbank'
          className={classNames(
            styles.nav,
            !router.pathname.includes('farm') && styles.active,
            router.pathname === '/redbank' && styles.unclickable,
          )}
        >
          {t('global.redBank')}
        </Link>
        {networkConfig.isFieldsEnabled && (
          <Link
            passHref
            href='/farm'
            className={classNames(
              styles.nav,
              router.pathname.includes('farm') && styles.active,
              router.pathname === '/farm' && styles.unclickable,
            )}
          >
            {t('global.fields')}
          </Link>
        )}
        <a
          className={styles.nav}
          href={getCouncilLink(currentNetwork, client?.connectedWallet.providerId as WalletID)}
          target='_blank'
          rel='noreferrer'
        >
          {t('global.council')}
        </a>
      </div>
      <div className={styles.connector}>
        <IncentivesButton />
        <ChainSelect />
        <Wallet />
        <Settings />
      </div>
    </header>
  )
}
