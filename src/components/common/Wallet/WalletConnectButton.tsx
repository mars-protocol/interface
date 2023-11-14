import classNames from 'classnames'
import { Button, SVG } from 'components/common/'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './WalletConnectButton.module.scss'

interface Props {
  textOverride?: string | ReactNode
  disabled?: boolean
  color?: 'primary' | 'secondary'
}

export const WalletConnectButton = ({ textOverride, disabled = false, color }: Props) => {
  const { t } = useTranslation()

  return (
    <div className={styles.wrapper}>
      <Button
        color={color ? color : 'quaternary'}
        disabled={disabled}
        onClick={() => {
          useStore.setState({ showWalletSelect: true })
        }}
        className={classNames(styles.button, !color && styles.outline)}
        prefix={<SVG.Wallet className={styles.svg} />}
        text={<span className='overline'>{textOverride || t('common.connectWallet')}</span>}
      ></Button>
    </div>
  )
}
