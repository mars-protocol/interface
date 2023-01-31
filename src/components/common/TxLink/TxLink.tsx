import { SVG } from 'components/common'
import { truncate } from 'libs/text'
import { useTranslation } from 'react-i18next'

import styles from './TxLink.module.scss'

interface Props {
  hash: string
  link: string
}

export const TxLink = ({ hash, link }: Props) => {
  const { t } = useTranslation()

  return (
    <a
      href={link}
      className={styles.txLink}
      target='_blank'
      rel='noreferrer noopener'
      title={t('common.txHash')}
    >
      <span>{truncate(hash)}</span>
      <SVG.ExternalLink />
    </a>
  )
}
