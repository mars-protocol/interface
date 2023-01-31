import classNames from 'classnames'
import { SVG } from 'components/common'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './MobileNav.module.scss'

export const MobileNav = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const networkConfig = useStore((s) => s.networkConfig)

  return (
    <nav className={styles.mobileNav}>
      <Link href='/redbank' passHref>
        <a className={classNames(styles.nav, !router.pathname.includes('farm') && styles.active)}>
          <SVG.RedBankIcon />
          <span>{t('global.redBank')}</span>
        </a>
      </Link>
      <a className={styles.nav} target='_blank' href={networkConfig?.councilUrl} rel='noreferrer'>
        <SVG.CouncilIcon />
        <span>{t('global.council')}</span>
      </a>
      <Link href='/farm' passHref>
        <a className={classNames(styles.nav, router.pathname.includes('farm') && styles.active)}>
          <SVG.FieldsIcon />
          <span>{t('global.fields')}</span>
        </a>
      </Link>
    </nav>
  )
}
