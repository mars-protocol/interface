import BigNumber from 'bignumber.js'
import { AnimatedNumber, Apy, Card, DisplayCurrency, Loading, TextTooltip } from 'components/common'
import { VaultLogo, VaultName } from 'components/fields'
import { getTimeAndUnit, ltvToLeverage } from 'libs/parse'
import Link from 'next/link'
import { Trans, useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './AvailableVaultsTableMobile.module.scss'

export const AvailableVaultsTableMobile = () => {
  const { t } = useTranslation()
  const availableVaults = useStore((s) => s.availableVaults)
  const redBankAssets = useStore((s) => s.redBankAssets)

  if (!availableVaults?.length) return null

  return (
    <Card
      title={t('fields.availableVaults')}
      styleOverride={{ marginBottom: 40 }}
      tooltip={<Trans i18nKey='fields.tooltips.availableVaults.mobile' />}
    >
      <div className={styles.container}>
        {availableVaults.map((vault, i) => {
          const primaryBorrowAsset = redBankAssets.find(
            (asset) => asset.denom === vault.denoms.primary,
          )
          const secondaryBorrowAsset = redBankAssets.find(
            (asset) => asset.denom === vault.denoms.secondary,
          )
          const borrowRate = Math.min(
            Number(primaryBorrowAsset?.borrowRate || 1000),
            Number(secondaryBorrowAsset?.borrowRate || 1000),
          )
          const maxBorrowRate = borrowRate * (ltvToLeverage(vault.ltv.contract) - 1)
          const minAPY = new BigNumber(vault.apy.total || 0).toNumber()

          const leverage = ltvToLeverage(vault.ltv.contract)
          const maxAPY =
            new BigNumber(minAPY).times(leverage).decimalPlaces(2).toNumber() - maxBorrowRate

          return (
            <Link
              key={`${vault.address}-${i}`}
              href={`/farm/vault/${vault.address}/create`}
              className={styles.link}
            >
              <div className={styles.grid} key={`${vault.address}-${i}`}>
                <div className={styles.logo}>
                  <VaultLogo vault={vault} />
                </div>
                <div className={styles.name}>
                  <VaultName vault={vault} />
                </div>
                <div className={styles.stats}>
                  <div onClick={(e) => e.preventDefault()} className='xl'>
                    <span className='faded'>{t('common.apy')} </span>
                    {vault.apy !== null ? (
                      <span>
                        <TextTooltip
                          hideStyling
                          text={<AnimatedNumber amount={Math.min(minAPY, maxAPY)} suffix=' - ' />}
                          tooltip={<Apy apyData={vault.apy} borrowRate={0} leverage={1} />}
                        />
                        <TextTooltip
                          hideStyling
                          text={<AnimatedNumber amount={Math.max(minAPY, maxAPY)} suffix='%' />}
                          tooltip={
                            <Apy
                              apyData={vault.apy}
                              borrowRate={maxBorrowRate}
                              leverage={ltvToLeverage(vault.ltv.contract)}
                            />
                          }
                        />
                      </span>
                    ) : (
                      <Loading style={{ display: 'inline-block' }} />
                    )}
                  </div>
                  <div className='s'>
                    <span className='faded'>{t('fields.leverage')} </span>
                    <AnimatedNumber amount={leverage} suffix='x' />
                  </div>
                  <div className='s'>
                    <span className='faded'>{t('fields.vaultCap')} </span>
                    <span>
                      <DisplayCurrency
                        coin={{
                          denom: vault.vaultCap?.denom || '',
                          amount: (vault.vaultCap?.max || 0).toString(),
                        }}
                        className={styles.inline}
                      />
                    </span>
                  </div>
                </div>
                <div className={styles.description}>
                  {t('fields.tooltips.name', {
                    asset1: vault.symbols.primary,
                    asset2: vault.symbols.secondary,
                    ...getTimeAndUnit(vault.lockup),
                  })}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
