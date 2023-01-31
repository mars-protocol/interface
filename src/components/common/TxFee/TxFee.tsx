import { Coin } from '@cosmjs/stargate'
import { format, formatValue, lookupDecimals, lookupSymbol } from 'libs/parse'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './TxFee.module.scss'

interface Props {
  txFee?: Coin
  styleOverride?: any
  displayLabel?: boolean
  textStyle?: string
}

export const TxFee = ({
  txFee,
  styleOverride = {},
  displayLabel = true,
  textStyle = '',
}: Props) => {
  const { t } = useTranslation()
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)

  if (!txFee) return <></>
  return (
    <div className={`${textStyle} ${styles.txFee}`} style={styleOverride}>
      {displayLabel && (
        <div className={`${styles.label}`}>
          <span>{t('common.txFee')}</span>
        </div>
      )}
      <div className='number'>
        {formatValue(
          format(txFee.amount, txFee.denom, lookupDecimals(txFee.denom, whitelistedAssets)),
          2,
          2,
          true,
          false,
          ` ${lookupSymbol(txFee.denom, whitelistedAssets)}`,
          true,
        )}
      </div>
    </div>
  )
}
