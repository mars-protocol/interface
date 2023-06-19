import { Row } from '@tanstack/react-table'
import classNames from 'classnames/bind'
import { Button, SVG, TextTooltip } from 'components/common'
import { getSwapUrl } from 'functions'
import { balanceSum } from 'libs/assetInfo'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './ActionsRow.module.scss'

interface Props {
  row: Row<RedBankAsset>
  type: 'deposit' | 'borrow'
}

export const ActionsRow = ({ row, type }: Props) => {
  const { t } = useTranslation()
  const router = useRouter()
  const chainInfo = useStore((s) => s.chainInfo)
  const redBankAssets = useStore((s) => s.redBankAssets)
  const assetPricesUSD = useStore((s) => s.assetPricesUSD)
  const hasBalance = Number(row.original.walletBalance ?? 0) > 0

  const hasDeposits = Number(row.original.depositBalance ?? 0) > 0
  const hasNeverDeposited = Number(balanceSum(redBankAssets, 'depositBalanceBaseCurrency')) === 0
  const appUrl = useStore((s) => s.networkConfig.appUrl) || ''
  const classes = classNames.bind(styles)
  const trClasses = classes({
    tr: true,
    expanded: row.getIsExpanded(),
  })
  const assetID = row.original.id

  const assetPrice = assetPricesUSD?.find((asset) => asset.denom === row.original.denom)?.amount

  return (
    <tr key={row.id} className={trClasses} onClick={() => row.toggleExpanded()}>
      <td key={row.id} className={styles.td} colSpan={7}>
        <div className={styles.wrapper}>
          {type === 'deposit' && (
            <>
              <Button
                color='tertiary'
                onClick={() => {
                  window.open(
                    getSwapUrl({
                      baseUrl: appUrl,
                      to: assetID,
                    }),
                  )
                }}
                prefix={<SVG.ExternalLink />}
                size='small'
                text={t('common.buy')}
              />
              <TextTooltip
                hideUnderline
                text={
                  <Button
                    color='tertiary'
                    disabled={!hasBalance || !assetPrice}
                    prefix={<SVG.Deposit />}
                    size='small'
                    text={t('redbank.deposit')}
                    onClick={() => router.push(`/redbank/deposit/${assetID}`)}
                  />
                }
                tooltip={
                  !assetPrice
                    ? t('redbank.noPriceAvailable', { symbol: row.original.symbol })
                    : !hasBalance
                    ? t('redbank.toDepositAssetOnChain', {
                        asset: assetID,
                        chain: chainInfo?.name,
                      })
                    : null
                }
              />
              {hasDeposits && (
                <Button
                  color='tertiary'
                  prefix={<SVG.Withdraw />}
                  size='small'
                  text={t('redbank.withdraw')}
                  onClick={() => router.push(`/redbank/withdraw/${assetID}`)}
                />
              )}
            </>
          )}
          {type === 'borrow' && (
            <>
              {Number(row.original.borrowBalance) > 0 && (
                <>
                  {!hasBalance && (
                    <Button
                      color='tertiary'
                      onClick={() => {
                        window.open(
                          getSwapUrl({
                            baseUrl: appUrl,
                            to: assetID,
                          }),
                        )
                      }}
                      prefix={<SVG.ExternalLink />}
                      size='small'
                      text={t('common.buy')}
                    />
                  )}
                  <TextTooltip
                    hideUnderline
                    text={
                      <Button
                        disabled={!hasBalance}
                        color='tertiary'
                        prefix={<SVG.Deposit />}
                        size='small'
                        text={t('common.repay')}
                        onClick={() => router.push(`/redbank/repay/${assetID}`)}
                      />
                    }
                    tooltip={
                      !hasBalance
                        ? t('redbank.noFundsForRepay', {
                            symbol: assetID,
                          })
                        : null
                    }
                  />
                </>
              )}
              <TextTooltip
                hideUnderline
                text={
                  <Button
                    color='tertiary'
                    prefix={<SVG.Withdraw />}
                    disabled={
                      row.original.marketLiquidity === '0' || hasNeverDeposited || !assetPrice
                    }
                    size='small'
                    text={t('common.borrow')}
                    onClick={() => router.push(`/redbank/borrow/${assetID}`)}
                  />
                }
                tooltip={
                  row.original.marketLiquidity === '0' || hasNeverDeposited || !assetPrice
                    ? hasNeverDeposited
                      ? t('redbank.warning.borrow')
                      : !assetPrice
                      ? t('redbank.noPriceAvailable', { symbol: row.original.symbol })
                      : t('redbank.notEnoughMarketLiquidity')
                    : null
                }
              />
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
