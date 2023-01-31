import { Row } from '@tanstack/react-table'
import Tippy from '@tippyjs/react/headless'
import classNames from 'classnames/bind'
import { Button, SVG } from 'components/common'
import { getSwapUrl } from 'functions'
import { balanceSum } from 'libs/assetInfo'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './ActionsRow.module.scss'

interface Props {
  row: Row<RedBankAsset>
  type: 'deposit' | 'borrow'
}

export const ActionsRow = ({ row, type }: Props) => {
  const { t } = useTranslation()
  const chainInfo = useStore((s) => s.chainInfo)
  const redBankAssets = useStore((s) => s.redBankAssets)
  const hasBalance = Number(row.original.walletBalance ?? 0) > 0
  const hasDeposits = Number(row.original.depositBalance ?? 0) > 0
  const hasNeverDeposited = Number(balanceSum(redBankAssets, 'depositBalanceBaseCurrency')) === 0
  const appUrl = useStore((s) => s.networkConfig?.appUrl) || ''
  const classes = classNames.bind(styles)
  const trClasses = classes({
    tr: true,
    expanded: row.getIsExpanded(),
  })
  const assetSymbol = row.original.symbol

  return (
    <tr key={row.id} className={trClasses} onClick={() => row.toggleExpanded()}>
      <td key={row.id} className={styles.td} colSpan={10}>
        <div className={styles.wrapper}>
          {type === 'deposit' && (
            <>
              <Button
                color='tertiary'
                onClick={() => {
                  window.open(
                    getSwapUrl({
                      baseUrl: appUrl,
                      to: assetSymbol,
                    }),
                  )
                }}
                prefix={<SVG.ExternalLink />}
                size='small'
                text={t('common.buy')}
              />
              <Tippy
                appendTo={() => document.body}
                interactive={false}
                render={(attrs) => {
                  return hasBalance ? null : (
                    <div className='tippyContainer' {...attrs}>
                      {t('redbank.toDepositAssetOnChain', {
                        asset: assetSymbol,
                        chain: chainInfo?.chainName,
                      })}
                    </div>
                  )
                }}
              >
                <div>
                  <Link href={`/redbank/deposit/${assetSymbol}`} passHref>
                    <Button
                      color='tertiary'
                      disabled={!hasBalance}
                      prefix={<SVG.Deposit />}
                      size='small'
                      text={t('redbank.deposit')}
                    />
                  </Link>
                </div>
              </Tippy>
              {hasDeposits && (
                <Link href={`/redbank/withdraw/${assetSymbol}`} passHref>
                  <Button
                    color='tertiary'
                    prefix={<SVG.Withdraw />}
                    size='small'
                    text={t('redbank.withdraw')}
                  />
                </Link>
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
                            to: assetSymbol,
                          }),
                        )
                      }}
                      prefix={<SVG.ExternalLink />}
                      size='small'
                      text={t('common.buy')}
                    />
                  )}
                  <Tippy
                    appendTo={() => document.body}
                    interactive={false}
                    render={(attrs) => {
                      return !hasBalance || hasNeverDeposited ? (
                        <div className='tippyContainer' {...attrs}>
                          {hasBalance
                            ? t('redbank.warning.borrow')
                            : t('redbank.noFundsForRepay', {
                                symbol: assetSymbol,
                              })}
                        </div>
                      ) : null
                    }}
                  >
                    <div>
                      <Link href={`/redbank/repay/${assetSymbol}`} passHref>
                        <Button
                          disabled={!hasBalance}
                          color='tertiary'
                          prefix={<SVG.Deposit />}
                          size='small'
                          text={t('common.repay')}
                        />
                      </Link>
                    </div>
                  </Tippy>
                </>
              )}
              <Tippy
                appendTo={() => document.body}
                interactive={false}
                render={(attrs) => {
                  return row.original.marketLiquidity === '0' || hasNeverDeposited ? (
                    <div className='tippyContainer' {...attrs}>
                      {hasNeverDeposited
                        ? t('redbank.warning.borrow')
                        : t('redbank.notEnoughMarketLiquidity')}
                    </div>
                  ) : null
                }}
              >
                <div>
                  <Link href={`/redbank/borrow/${assetSymbol}`} passHref>
                    <Button
                      color='tertiary'
                      prefix={<SVG.Withdraw />}
                      disabled={row.original.marketLiquidity === '0' || hasNeverDeposited}
                      size='small'
                      text={t('common.borrow')}
                    />
                  </Link>
                </div>
              </Tippy>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
