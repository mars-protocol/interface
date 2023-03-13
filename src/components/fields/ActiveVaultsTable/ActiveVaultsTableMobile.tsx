import BigNumber from 'bignumber.js'
import {
  AnimatedNumber,
  Apy,
  BorrowCapacity,
  Card,
  DisplayCurrency,
  TextTooltip,
} from 'components/common'
import { Loading } from 'components/common'
import { VaultLogo, VaultName } from 'components/fields'
import { FIELDS_TUTORIAL_KEY } from 'constants/appConstants'
import { getLiqBorrowValue, getMaxBorrowValue } from 'functions/fields'
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
          const maxBorrowValue = getMaxBorrowValue(vault, vault.position)

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
                    {vault.position.apy.net !== null && vault.position.apy.total !== null ? (
                      <TextTooltip
                        hideStyling
                        text={
                          <span>
                            <AnimatedNumber
                              amount={vault.position.apy.net}
                              className='xl'
                              suffix='%'
                            />
                          </span>
                        }
                        tooltip={
                          <Apy
                            apyData={{
                              borrow: vault.position.apy.borrow,
                              total: vault.position.apy.total,
                            }}
                            leverage={vault.position.currentLeverage}
                          />
                        }
                      />
                    ) : (
                      <Loading style={{ display: 'inline-block' }} />
                    )}
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
                      amount: (vault.position.borrowDenom === vault.denoms.primary
                        ? vault.position.amounts.borrowedPrimary
                        : vault.position.amounts.borrowedSecondary
                      ).toString(),
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
                  max={getLiqBorrowValue(vault, vault.position.values.net)}
                  limit={maxBorrowValue}
                  balance={
                    vault.position.borrowDenom === vault.denoms.primary
                      ? vault.position.values.borrowedPrimary
                      : vault.position.values.borrowedSecondary
                  }
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
