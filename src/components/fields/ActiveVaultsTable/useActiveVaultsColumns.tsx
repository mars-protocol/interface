import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import {
  AnimatedNumber,
  Apy,
  BorrowCapacity,
  Button,
  DisplayCurrency,
  SVG,
  TextTooltip,
  TokenBalance,
} from 'components/common'
import { VaultLogo, VaultName } from 'components/fields'
import { VAULT_DEPOSIT_BUFFER } from 'constants/appConstants'
import { convertPercentage } from 'functions'
import { getLiqBorrowValue, getMaxBorrowValue } from 'functions/fields'
import {
  convertApyToDailyApy,
  formatUnlockDate,
  formatValue,
  getTimeAndUnit,
  ltvToLeverage,
} from 'libs/parse'
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
        cell: ({ row }) => {
          return (
            <TextTooltip
              text={<VaultName vault={row.original} />}
              tooltip={t('fields.tooltips.name', {
                asset1: row.original.symbols.primary,
                asset2: row.original.symbols.secondary,
                ...getTimeAndUnit(row.original.lockup),
              })}
            />
          )
        },
      }),
      columnHelper.accessor('position.values.total', {
        enableSorting: true,
        header: () => (
          <TextTooltip
            text={t('fields.positionValueShort')}
            tooltip={t('fields.tooltips.positionValue')}
          />
        ),
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
            <TextTooltip
              text={
                <DisplayCurrency
                  coin={{
                    denom: baseCurrency.denom,
                    amount: row.original.position.values.total.toString(),
                  }}
                />
              }
              tooltip={
                <>
                  <TokenBalance coin={primaryCoin} maxDecimals={2} showSymbol />
                  <br />
                  <TokenBalance coin={secondaryCoin} maxDecimals={2} showSymbol />
                </>
              }
            />
          )
        },
      }),
      columnHelper.accessor('position.values.primary', {
        enableSorting: true,
        header: () => (
          <TextTooltip text={t('fields.netValue')} tooltip={t('fields.tooltips.netValue')} />
        ),
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
            <TextTooltip
              text={
                <DisplayCurrency
                  coin={{ denom: baseCurrency.denom, amount: netValue.toString() }}
                />
              }
              tooltip={
                <>
                  <TokenBalance coin={coins[0]} maxDecimals={2} showSymbol />
                  <br />
                  <TokenBalance coin={coins[1]} maxDecimals={2} showSymbol />
                </>
              }
            />
          )
        },
      }),
      columnHelper.accessor('position.values.borrowed', {
        enableSorting: true,
        header: () => (
          <TextTooltip text={t('common.borrowed')} tooltip={t('fields.tooltips.borrowValue')} />
        ),
        cell: (info) => {
          const borrowAsset = whitelistedAssets.find(
            (asset) => asset.denom === info.row.original.denoms.secondary,
          )
          if (!borrowAsset) return

          return (
            <TextTooltip
              text={
                <DisplayCurrency
                  coin={{
                    denom: baseCurrency.denom,
                    amount: info.row.original.position.values.borrowed.toString(),
                  }}
                />
              }
              tooltip={
                <TokenBalance
                  coin={{
                    denom: info.row.original.denoms.secondary,
                    amount: info.row.original.position.amounts.borrowed.toString(),
                  }}
                  maxDecimals={2}
                  showSymbol
                />
              }
            />
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
            <TextTooltip
              text={
                <>
                  <DisplayCurrency
                    coin={{
                      denom: baseCurrency.denom,
                      amount: vaultCap.max.toString(),
                    }}
                  />
                  <p className={percentClasses}>
                    {percent}% {t('common.used')}
                  </p>
                </>
              }
              tooltip={
                <TokenBalance
                  showSymbol
                  coin={{
                    denom: baseCurrency.denom,
                    amount: vaultCap.max.toString(),
                  }}
                />
              }
            />
          )
        },
      }),
      columnHelper.accessor('position.apy', {
        id: 'apy',
        enableSorting: true,
        header: () => (
          <TextTooltip text={t('common.apy')} tooltip={t('fields.tooltips.apy.active')} />
        ),
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
              const apy = new BigNumber(row.original.position.apy.net).toNumber()

              const apyData = {
                total: row.original.apy || 0,
                borrow: row.original.position.apy.borrow,
              }
              return (
                <>
                  <TextTooltip
                    hideStyling
                    text={
                      <>
                        <AnimatedNumber amount={apy} className='m' suffix='%' />
                        <p className='s faded'>
                          {convertApyToDailyApy(row.original.position.apy.net)}%/{t('common.day')}
                        </p>
                      </>
                    }
                    tooltip={
                      <Apy apyData={apyData} leverage={row.original.position.currentLeverage} />
                    }
                  />
                </>
              )
            case 'unlocking':
              return (
                <>
                  <p className='m'>{t('fields.unlocking')}</p>
                  <p className='s faded'>
                    {formatUnlockDate(row.original.position?.unlockAtTimestamp || 0)}
                  </p>
                </>
              )
          }
        },
      }),
      columnHelper.accessor('ltv', {
        enableSorting: true,
        header: () => (
          <TextTooltip text={t('fields.leverage')} tooltip={t('fields.tooltips.leverage.active')} />
        ),
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
        header: () => (
          <TextTooltip
            text={t('common.borrowingCapacity')}
            tooltip={t('fields.tooltips.borrowCapacity')}
          />
        ),
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
