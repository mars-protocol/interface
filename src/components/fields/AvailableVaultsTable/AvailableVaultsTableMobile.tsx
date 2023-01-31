import BigNumber from 'bignumber.js'
import { AnimatedNumber, Card } from 'components/common'
import { VaultLogo, VaultName } from 'components/fields'
import { formatValue, ltvToLeverage } from 'libs/parse'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './AvailableVaultsTableMobile.module.scss'

export const AvailableVaultsTableMobile = () => {
  const { t } = useTranslation()
  const availableVaults = useStore((s) => s.availableVaults)
  const baseCurrency = useStore((s) => s.baseCurrency)

  if (!availableVaults?.length) return null

  return (
    <Card
      title={t('fields.availableVaults')}
      styleOverride={{ marginBottom: 40 }}
      tooltip={<Trans i18nKey='fields.tooltips.availableVaults' />}
    >
      <div className={styles.container}>
        {availableVaults.map((vault, i) => {
          const minAPY = new BigNumber(vault.apy || 0).decimalPlaces(2).toNumber()
          const maxAPY = new BigNumber(minAPY).times(ltvToLeverage(vault.ltv.max)).toNumber()
          const leverage = ltvToLeverage(vault.ltv.max)
          return (
            <div className={styles.grid} key={`${vault.address}-${i}`}>
              <div className={styles.logo}>
                <VaultLogo vault={vault} />
              </div>
              <div className={styles.name}>
                <VaultName vault={vault} />
              </div>
              <div className={styles.stats}>
                <div className='xl'>
                  <span className='faded'>{t('common.apy')} </span>
                  <span>
                    <AnimatedNumber amount={minAPY} suffix='-' />
                    <AnimatedNumber amount={maxAPY} suffix='%' />
                  </span>
                </div>
                <div className='s'>
                  <span className='faded'>{t('fields.leverage')} </span>
                  <AnimatedNumber amount={leverage} suffix='x' />
                </div>
                <div className='s'>
                  <span className='faded'>{t('fields.vaultCap')} </span>
                  <span>
                    {formatValue(
                      (vault.vaultCap?.max || 0) / 10 ** baseCurrency.decimals,
                      0,
                      0,
                      true,
                      '',
                      ' ' + baseCurrency.symbol,
                    )}
                  </span>
                </div>
              </div>
              <div className={styles.description}>{vault.description}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
