import { CircularProgress, SVG } from 'components/common'
import { useTranslation } from 'react-i18next'
import { TxStatus } from 'types/enums/RedBankAction'

import styles from './InfoTitle.module.scss'

interface Props {
  title: string
  src: TxStatus
  subTitle: string
}
export const InfoTitle = ({ title, src, subTitle }: Props) => {
  const { t } = useTranslation()
  return (
    <div className={styles.container}>
      <span className={`h6`}>{title}</span>
      <div className={styles.indicator}>
        {src === TxStatus.FAILURE ? (
          <SVG.Failed />
        ) : src === TxStatus.LOADING ? (
          <CircularProgress size={80} />
        ) : (
          <SVG.Success />
        )}
      </div>
      {subTitle.length > 0 ? <span className={`h6 ${styles.subTitle}`}>{subTitle}</span> : null}
      {src === TxStatus.LOADING && (
        <p className={`colorInfoVoteAgainst ${styles.hint}`}>{t('common.approveTx')}</p>
      )}
    </div>
  )
}
