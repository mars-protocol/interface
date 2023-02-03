import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import Tippy from '@tippyjs/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import {
  AnimatedNumber,
  Apy,
  Button,
  DisplayCurrency,
  SVG,
  TextTooltip,
  TokenBalance,
} from 'components/common'
import { VaultLogo, VaultName } from 'components/fields'
import { VAULT_DEPOSIT_BUFFER } from 'constants/appConstants'
import { convertPercentage } from 'functions'
import { convertApyToDailyApy, formatValue, getTimeAndUnit, ltvToLeverage } from 'libs/parse'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './useAvailableVaultsColumns.module.scss'

export const useAvailableVaultsColumns = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const baseCurrency = useStore((s) => s.baseCurrency)
  const columnHelper = createColumnHelper<Vault>()
  const redBankAssets = useStore((s) => s.redBankAssets)

  const defaultAvailableVaultsColumns: ColumnDef<Vault, any>[] = useMemo(
    () => [
      columnHelper.accessor('color', {
        enableSorting: false,
        header: '',
        cell: (info) => <div style={{ background: info.getValue() }} className={styles.color} />,
      }),
      columnHelper.accessor('denoms', {
        enableSorting: false,
        header: '',
        cell: (info) => <VaultLogo vault={info.row.original} />,
      }),
      columnHelper.accessor('name', {
        enableSorting: true,
        header: t('fields.name'),
        cell: ({ row }) => {
          return (
            <Tippy
              appendTo={() => document.body}
              animation={false}
              render={(attrs) => {
                return (
                  <div className='tippyContainer' {...attrs}>
                    {t('fields.tooltips.name', {
                      asset1: row.original.symbols.primary,
                      asset2: row.original.symbols.secondary,
                      ...getTimeAndUnit(row.original.lockup),
                    })}
                  </div>
                )
              }}
            >
              <div>
                <VaultName vault={row.original} />
              </div>
            </Tippy>
          )
        },
      }),
      columnHelper.accessor('ltv', {
        enableSorting: true,
        header: () => (
          <TextTooltip
            text={t('fields.leverage')}
            tooltip={t('fields.tooltips.leverage.available')}
          />
        ),
        cell: ({ row }) => {
          return (
            <>
              <p className='m'>
                {formatValue(ltvToLeverage(row.original.ltv.max), 2, 2, false, false, 'x')}
              </p>
              <p className='s faded'>{t('global.max_lower')}</p>
            </>
          )
        },
      }),
      columnHelper.accessor('apy', {
        id: 'apy',
        enableSorting: true,
        header: () => (
          <TextTooltip text={t('common.apy')} tooltip={t('fields.tooltips.apy.available')} />
        ),
        cell: ({ row }) => {
          if (!row.original.apy) {
            return null
          }

          const maxLeverage = ltvToLeverage(row.original.ltv.max)
          const borrowAsset = redBankAssets.find(
            (asset) => asset.denom === row.original.denoms.secondary,
          )
          const maxBorrowRate = Number(borrowAsset?.borrowRate ?? 0) * row.original.ltv.max
          const minAPY = new BigNumber(row.original.apy).decimalPlaces(2).toNumber()

          const maxAPY = new BigNumber(minAPY).times(maxLeverage).toNumber() - maxBorrowRate
          const minDailyAPY = new BigNumber(convertApyToDailyApy(row.original.apy))
            .decimalPlaces(2)
            .toNumber()
          const maxDailyAPY = new BigNumber(minDailyAPY)
            .times(maxLeverage)
            .decimalPlaces(2)
            .toNumber()
          const apyDataNoLev = { total: row.original.apy || 0, borrow: 0 }
          const apyDataLev = { total: row.original.apy || 0, borrow: maxBorrowRate }

          return (
            <>
              <Tippy content={<Apy apyData={apyDataNoLev} leverage={1} />}>
                <span className='tooltip m'>
                  <AnimatedNumber amount={minAPY} />
                </span>
              </Tippy>
              <span>-</span>
              <Tippy
                content={
                  <Apy apyData={apyDataLev} leverage={ltvToLeverage(row.original.ltv.max)} />
                }
              >
                <span className='tooltip ,'>
                  <AnimatedNumber amount={maxAPY} suffix='%' />
                </span>
              </Tippy>

              <p className='s faded'>
                {minDailyAPY}-{maxDailyAPY}%/
                {t('common.day')}
              </p>
            </>
          )
        },
      }),
      columnHelper.accessor('vaultCap', {
        enableSorting: true,
        header: () => (
          <TextTooltip text={t('fields.vaultCap')} tooltip={t('fields.tooltips.vaultCap')} />
        ),
        cell: ({ row }) => {
          if (!row.original.vaultCap) {
            return null
          }

          const percent = convertPercentage(
            (row.original.vaultCap.used / (row.original.vaultCap.max * VAULT_DEPOSIT_BUFFER)) * 100,
          )
          const percentClasses = classNames('s', 'faded', percent >= 100 ? 'colorInfoLoss' : '')
          const vaultCap = row.original.vaultCap

          return (
            <Tippy
              appendTo={() => document.body}
              animation={false}
              render={(attrs) => {
                return (
                  <div className='tippyContainer' {...attrs}>
                    <TokenBalance
                      showSymbol
                      coin={{
                        denom: baseCurrency.denom,
                        amount: vaultCap.max.toString(),
                      }}
                    />
                  </div>
                )
              }}
            >
              <div>
                <DisplayCurrency
                  coin={{
                    denom: baseCurrency.denom,
                    amount: vaultCap.max.toString(),
                  }}
                />
                <p className={percentClasses}>
                  {percent}% {t('common.used')}
                </p>
              </div>
            </Tippy>
          )
        },
      }),
      columnHelper.accessor('provider', {
        enableSorting: true,
        header: t('common.by'),
        cell: () => <SVG.Apollo />,
      }),
      columnHelper.accessor('description', {
        enableSorting: true,
        header: t('common.description'),
        cell: ({ row }) => (
          <Tippy
            appendTo={() => document.body}
            animation={false}
            render={(attrs) => {
              return (
                <div className='tippyContainer' {...attrs}>
                  {t('fields.tooltips.name', {
                    asset1: row.original.symbols.primary,
                    asset2: row.original.symbols.secondary,
                    ...getTimeAndUnit(row.original.lockup),
                  })}
                </div>
              )
            }}
          >
            <p>{row.original.description}</p>
          </Tippy>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        cell: ({ row }) => {
          return (
            <Button
              onClick={() => router.push(`farm/vault/${row.original.address}/create`)}
              color='quaternary'
              prefix={<SVG.Deposit />}
              variant='round'
            />
          )
        },
      }),
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseCurrency.denom, router, t],
  )

  return {
    defaultAvailableVaultsColumns,
  }
}
