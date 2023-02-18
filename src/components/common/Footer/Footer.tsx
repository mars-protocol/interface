import { SVG } from 'components/common'
import { FIELDS_FEATURE } from 'constants/appConstants'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { DocURL } from 'types/enums/docURL'

import styles from './Footer.module.scss'

export const Footer = () => {
  const { t } = useTranslation()
  const networkConfig = useStore((s) => s.networkConfig)

  return (
    <footer className={styles.footer}>
      <div className={styles.widthBox}>
        <div className={styles.links}>
          <div className={styles.column1}>
            <div className={styles.header}>{t('global.mars')}</div>
            <a
              className={styles.item}
              href='https://osmosis.marsprotocol.io/#/redbank'
              rel='noopener noreferrer'
              target='_blank'
              title={t('global.redBank')}
            >
              {t('global.redBank')}
            </a>
            {FIELDS_FEATURE && (
              <a
                className={styles.item}
                href='https://osmosis.marsprotocol.io/#/farm'
                rel='noopener noreferrer'
                target='_blank'
                title={t('global.fields')}
              >
                {t('global.fields')}
              </a>
            )}
            <a
              className={styles.item}
              href={networkConfig?.councilUrl}
              rel='noopener noreferrer'
              target='_blank'
              title={t('global.council')}
            >
              {t('global.council')}
            </a>
            <a
              className={styles.item}
              href='http://explorer.marsprotocol.io/'
              rel='noopener noreferrer'
              target='_blank'
              title={t('global.blockExplorer')}
            >
              {t('global.blockExplorer')}
            </a>
          </div>
          <div className={styles.column2}>
            <div className={styles.header}>{t('global.documentation')}</div>
            <a
              className={styles.item}
              href='https://docs.marsprotocol.io'
              rel='noopener noreferrer'
              target='_blank'
              title={t('global.docs')}
            >
              {t('global.docs')}
            </a>
            <a
              className={styles.item}
              href='https://whitepaper.marsprotocol.io'
              rel='noopener noreferrer'
              target='_blank'
              title={t('global.whitepaper')}
            >
              {t('global.whitepaper')}
            </a>
            <a
              className={styles.item}
              href={DocURL.TERMS_OF_SERVICE_URL}
              rel='noopener noreferrer'
              target='_blank'
              title={t('global.termsOfService')}
            >
              {t('global.termsOfService')}
            </a>
            <a
              className={styles.item}
              href={DocURL.COOKIE_POLICY_URL}
              rel='noopener noreferrer'
              target='_blank'
              title={t('global.cookiePolicy')}
            >
              {t('global.cookiePolicy')}
            </a>
            <a
              className={styles.item}
              href={DocURL.PRIVACY_POLICY_URL}
              rel='noopener noreferrer'
              target='_blank'
              title={t('global.privacyPolicy')}
            >
              {t('global.privacyPolicy')}
            </a>
            <a
              className={styles.item}
              href={DocURL.SECURITY}
              rel='noopener noreferrer'
              target='_blank'
              title={t('global.security')}
            >
              {t('global.security')}
            </a>
          </div>
          <div className={styles.column3}>
            <div className={styles.header}>{t('global.community')}</div>
            <a
              className={styles.item}
              href='https://blog.marsprotocol.io'
              rel='noopener noreferrer'
              target='_blank'
              title={t('global.blog')}
            >
              {t('global.blog')}
            </a>
            <a
              className={styles.item}
              href='https://forum.marsprotocol.io'
              rel='noopener noreferrer'
              target='_blank'
              title={t('global.forum')}
            >
              {t('global.forum')}
            </a>
            <ul className={styles.socials}>
              <li>
                <a
                  href='https://twitter.marsprotocol.io'
                  rel='noopener noreferrer'
                  target='_blank'
                  title='Twitter'
                >
                  <SVG.Twitter />
                </a>
              </li>
              <li>
                <a
                  href='https://medium.marsprotocol.io'
                  rel='noopener noreferrer'
                  target='_blank'
                  title='<Medium'
                >
                  <SVG.Medium />
                </a>
              </li>
              <li>
                <a
                  href='https://discord.marsprotocol.io'
                  rel='noopener noreferrer'
                  target='_blank'
                  title='Discord'
                >
                  <SVG.Discord />
                </a>
              </li>
              <li>
                <a
                  href='https://reddit.marsprotocol.io'
                  rel='noopener noreferrer'
                  target='_blank'
                  title='Reddit'
                >
                  <SVG.Reddit />
                </a>
              </li>
              <li>
                <a
                  href='https://telegram.marsprotocol.io'
                  rel='noopener noreferrer'
                  target='_blank'
                  title='Telegram'
                >
                  <SVG.Telegram />
                </a>
              </li>
              <li>
                <a
                  href='https://youtube.marsprotocol.io'
                  rel='noopener noreferrer'
                  target='_blank'
                  title='YoutTube'
                >
                  <SVG.YouTube />
                </a>
              </li>
              <li>
                <a
                  href='https://github.marsprotocol.io'
                  rel='noopener noreferrer'
                  target='_blank'
                  title='Github'
                >
                  <SVG.Github />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
