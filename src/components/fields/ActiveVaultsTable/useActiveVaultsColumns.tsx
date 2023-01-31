import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import Tippy from '@tippyjs/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames/bind'
import {
  AnimatedNumber,
  BorrowCapacity,
  Button,
  DisplayCurrency,
  SVG,
  TokenBalance,
} from 'components/common'
import { VaultLogo, VaultName } from 'components/fields'
import { VAULT_DEPOSIT_BUFFER } from 'constants/appConstants'
import { convertPercentage } from 'functions'
import { getLiqBorrowValue, getMaxBorrowValue } from 'functions/fields'
import { convertApyToDailyApy, formatUnlockDate, formatValue, ltvToLeverage } from 'libs/parse'
import { useRouter } from 'next/router'
import { ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './useActiveVaultsColumns.module.scss'

export const useActiveVaultsColumns = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const baseCurrency = useStore((s) => s.baseCurrency)
  const whitelistedAssets = useStore((s) => s.whitelistedAssets)
  const columnHelper = createColumnHelper<ActiveVault>()
  const defaultActiveVaultsColumns: ColumnDef<ActiveVault, any>[] = useMemo(
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
        header: t('fields.position'),
        cell: ({ row }) => <VaultName vault={row.original} />,
      }),
      columnHelper.accessor('position.values.total', {
        enableSorting: true,
        header: t('fields.positionValueShort'),
        cell: ({ row }) => {
          const primaryCoin = {
            denom: row.original.denoms.primary,
            amount: row.original.position.amounts.primary.toString(),
          }

          const secondaryCoin = {
            denom: row.original.denoms.secondary,
            amount: (
              row.original.position.amounts.secondary + row.original.position.amounts.borrowed
            ).toString(),
          }

          return (
            <Tippy
              appendTo={() => document.body}
              animation={false}
              render={(attrs) => {
                return (
                  <div className='tippyContainer' {...attrs}>
                    <TokenBalance coin={primaryCoin} maxDecimals={2} showSymbol />
                    <br />
                    <TokenBalance coin={secondaryCoin} maxDecimals={2} showSymbol />
                  </div>
                )
              }}
            >
              <div>
                <DisplayCurrency
                  coin={{
                    denom: baseCurrency.denom,
                    amount: row.original.position.values.total.toString(),
                  }}
                />
              </div>
            </Tippy>
          )
        },
      }),
      columnHelper.accessor('position.values.primary', {
        enableSorting: true,
        header: t('fields.netValue'),
        cell: ({ row }) => {
          const position = row.original.position
          const netValue = position.values.primary + position.values.secondary
          const coins = [
            {
              denom: row.original.denoms.primary,
              amount: position.amounts.primary.toString(),
            },
            {
              denom: row.original.denoms.secondary,
              amount: position.amounts.secondary.toString(),
            },
          ]

          return (
            <Tippy
              appendTo={() => document.body}
              animation={false}
              render={(attrs) => {
                return (
                  <div className='tippyContainer' {...attrs}>
                    <TokenBalance coin={coins[0]} maxDecimals={2} showSymbol />
                    <br />
                    <TokenBalance coin={coins[1]} maxDecimals={2} showSymbol />
                  </div>
                )
              }}
            >
              <div>
                <DisplayCurrency
                  coin={{ denom: baseCurrency.denom, amount: netValue.toString() }}
                />
              </div>
            </Tippy>
          )
        },
      }),
      columnHelper.accessor('position.values.borrowed', {
        enableSorting: true,
        header: t('common.borrowed'),
        cell: (info) => {
          const borrowAsset = whitelistedAssets.find(
            (asset) => asset.denom === info.row.original.denoms.secondary,
          )
          if (!borrowAsset) return

          return (
            <Tippy
              appendTo={() => document.body}
              animation={false}
              render={(attrs) => {
                return (
                  <div className='tippyContainer' {...attrs}>
                    <TokenBalance
                      coin={{
                        denom: info.row.original.denoms.secondary,
                        amount: info.row.original.position.amounts.borrowed.toString(),
                      }}
                      maxDecimals={2}
                      showSymbol
                    />
                  </div>
                )
              }}
            >
              <div>
                <DisplayCurrency
                  coin={{
                    denom: baseCurrency.denom,
                    amount: info.row.original.position.values.borrowed.toString(),
                  }}
                />
              </div>
            </Tippy>
          )
        },
      }),
      columnHelper.accessor('vaultCap', {
        enableSorting: true,
        header: t('fields.vaultCap'),
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
      columnHelper.accessor('position.apy', {
        id: 'apy',
        enableSorting: true,
        header: t('common.apy'),
        cell: ({ row }) => {
          switch (row.original.position.status) {
            case 'unlocked':
              return (
                <>
                  <p className='m colorInfoVoteAgainst'>{t('common.unlocked')}</p>
                  <p className='s faded'>{t('fields.notEarning')}</p>
                </>
              )
            case 'active':
              const apy = new BigNumber(row.original.position.apy).decimalPlaces(2).toNumber()
              return (
                <>
                  <AnimatedNumber amount={apy} className='m' suffix='%' />
                  <p className='s faded'>
                    {convertApyToDailyApy(row.original.position.apy)}%/{t('common.day')}
                  </p>
                </>
              )
            case 'unlocking':
              return (
                <>
                  <p className='m'>{t('fields.unlocking')}</p>
                  <p className='s faded'>
                    {/* {new Date(row.original.position?.unlockAtTimestamp || 0).} */}
                    {formatUnlockDate(row.original.position?.unlockAtTimestamp || 0)}
                  </p>
                </>
              )
          }
        },
      }),
      columnHelper.accessor('ltv', {
        enableSorting: true,
        header: t('fields.leverage'),
        cell: ({ row }) => {
          return (
            <>
              <p className='m'>
                {formatValue(ltvToLeverage(row.original.position.ltv), 2, 2, false, false, `x`)}
              </p>
              <p className='s faded'>
                {formatValue(
                  ltvToLeverage(row.original.ltv.max),
                  2,
                  2,
                  false,
                  false,
                  `x ${t('global.limit')}`,
                )}
              </p>
            </>
          )
        },
      }),
      columnHelper.accessor('position.amounts.borrowed', {
        enableSorting: false,
        header: t('common.borrowingCapacity'),
        cell: ({ row }) => {
          const maxBorrowValue = getMaxBorrowValue(row.original, row.original.position)

          return (
            <BorrowCapacity
              showPercentageText={true}
              max={getLiqBorrowValue(row.original, maxBorrowValue)}
              limit={maxBorrowValue}
              balance={row.original.position.values.borrowed}
              showTitle={false}
              barHeight={'16px'}
              hideValues
            />
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        cell: ({ row }) => {
          let route: string
          let prefix: ReactNode

          switch (row.original.position.status) {
            case 'active':
              route = 'edit'
              prefix = <SVG.Edit />
              break
            case 'unlocking':
              route = 'repay'
              prefix = <SVG.Deposit />
              break
            case 'unlocked':
              route = 'close'
              prefix = <SVG.Withdraw />
              break
          }

          return (
            <Button
              onClick={() => router.push(`/farm/vault/${row.original.address}/${route}`)}
              color='quaternary'
              prefix={prefix}
              variant='round'
            />
          )
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseCurrency.denom, router, t, whitelistedAssets],
  )
  return {
    defaultActiveVaultsColumns,
  }
}

export default useActiveVaultsColumns
