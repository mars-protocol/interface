import Tippy from '@tippyjs/react'
import BigNumber from 'bignumber.js'
import { AnimatedNumber, Apy, BorrowCapacity, Card, DisplayCurrency } from 'components/common'
import { VaultLogo, VaultName } from 'components/fields'
import { FIELDS_TUTORIAL_KEY } from 'constants/appConstants'
import Link from 'next/link'
import { Trans, useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './ActiveVaultsTableMobile.module.scss'

export const ActiveVaultsTableMobile = () => {
  const { t } = useTranslation()
  const activeVaults = useStore((s) => s.activeVaults)
  const baseCurrency = useStore((s) => s.baseCurrency)

  if (activeVaults.length && !localStorage.getItem(FIELDS_TUTORIAL_KEY)) {
    localStorage.setItem(FIELDS_TUTORIAL_KEY, 'true')
  }

  if (!activeVaults?.length) return null

  const getVaultSubText = (vault: ActiveVault) => {
    switch (vault.position.status) {
      case 'active':
        return <VaultName vault={vault} />
      case 'unlocking':
        return (
          <>
            <p className='m'>{vault.name}</p>
            <p className='m'>{t('fields.unlocking')}</p>
          </>
        )
      case 'unlocked':
        return (
          <>
            <p className='m'>{vault.name}</p>
            <p className='m colorInfoVoteAgainst'>{t('common.unlocked')}</p>
          </>
        )
    }
  }

  return (
    <Card
      title={t('fields.activeVaults')}
      styleOverride={{ marginBottom: 40 }}
      tooltip={<Trans i18nKey='fields.tooltips.activeVaults.mobile' />}
    >
      <div className={styles.container}>
        {activeVaults.map((vault, i) => {
          const content = (
            <div key={`${vault.address}-${i}`} className={styles.grid}>
              <div className={styles.logo}>
                <VaultLogo vault={vault} />
              </div>
              <div className={styles.name}>{getVaultSubText(vault)}</div>

              <div className={styles.position}>
                <div className='xl' onClick={(e) => e.preventDefault()}>
                  <span className='faded'>{t('common.apy')} </span>
                  <span>
                    <Tippy
                      content={
                        <Apy
                          apyData={{
                            borrow: vault.position.apy.borrow,
                            total: vault.position.apy.total,
                          }}
                          leverage={vault.position.currentLeverage}
                        />
                      }
                    >
                      <span className='tooltip xl'>
                        <AnimatedNumber amount={vault.position.apy.net} className='xl' suffix='%' />
                      </span>
                    </Tippy>
                  </span>
                </div>
                <div className='s'>
                  <span className='faded'>{t('fields.positionValueShort')} </span>
                  <DisplayCurrency
                    coin={{
                      denom: baseCurrency.denom,
                      amount: vault.position.values.total.toString(),
                    }}
                    className={`s ${styles.inline}`}
                  />
                </div>

                <div className='s'>
                  <span className='faded'>{t('common.net')} </span>
                  <DisplayCurrency
                    coin={{
                      denom: baseCurrency.denom,
                      amount: vault.position.values.net.toString(),
                    }}
                    className={styles.inline}
                  />
                </div>
                <div className='s'>
                  <span className='faded'>{t('common.debt')} </span>
                  <DisplayCurrency
                    coin={{
                      denom: baseCurrency.denom,
                      amount: vault.position.values.borrowed.toString(),
                    }}
                    className={styles.inline}
                  />
                </div>
                <div className='s'>
                  <span className='faded'>{t('fields.leverage')} </span>
                  {new BigNumber(vault.position.currentLeverage).toPrecision(3)}
                </div>
              </div>
              <div className={styles.borrowCapacity}>
                <BorrowCapacity
                  showPercentageText={true}
                  max={10}
                  limit={8}
                  balance={7}
                  showTitle={false}
                  barHeight={'16px'}
                  hideValues
                />
              </div>
            </div>
          )

          if (vault.position.status === 'unlocking') {
            return content
          }

          return (
            <Link
              key={`${vault.address}-${i}`}
              href={`/farm/vault/${vault.address}/${
                vault.position.status === 'active' ? 'edit' : 'close'
              }`}
              className={styles.link}
            >
              <div>{content}</div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
