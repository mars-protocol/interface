import classNames from 'classnames'
import { IncentivesButton, Settings, SVG } from 'components/common'
import { FIELDS_FEATURE } from 'constants/appConstants'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import { Connect } from './Connect'
import styles from './Header.module.scss'

export const Header = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const networkConfig = useStore((s) => s.networkConfig)

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <SVG.Logo />
      </div>
      <div className={styles.navbar}>
        <Link href='/redbank' passHref>
          <a className={classNames(styles.nav, !router.pathname.includes('farm') && styles.active)}>
            {t('global.redBank')}
          </a>
        </Link>
        <Link href='/farm' passHref>
          <a
            className={classNames(
              !FIELDS_FEATURE && styles.disabled,
              styles.nav,
              router.pathname.includes('farm') && styles.active,
            )}
          >
            {t('global.fields')}
          </a>
        </Link>
        <a className={styles.nav} href={networkConfig?.councilUrl} target='_blank' rel='noreferrer'>
          {t('global.council')}
        </a>
      </div>
      <div className={styles.connector}>
        <IncentivesButton />
        <Connect />
        <Settings />
      </div>
    </header>
  )
}
