import { useWalletManager, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Button, NumberInput, SVG, Toggle, Tooltip } from 'components/common'
import { DISPLAY_CURRENCY_KEY, ENABLE_ANIMATIONS_KEY, FIELDS_FEATURE } from 'constants/appConstants'
import React, { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './Settings.module.scss'

export const Settings = () => {
  const { t } = useTranslation()
  const inputPlaceholder = '...'
  const queryClient = useQueryClient()
  const slippages = [0.02, 0.03]
  const [showDetails, setShowDetails] = useState(false)
  const slippage = useStore((s) => s.slippage)
  const networkConfig = useStore((s) => s.networkConfig)
  const baseCurrency = useStore((s) => s.baseCurrency)
  const currencyAssets = useStore((s) => s.currencyAssets)
  const [customSlippage, setCustomSlippage] = useState<string>(inputPlaceholder)
  const [inputRef, setInputRef] = useState<React.RefObject<HTMLInputElement>>()
  const [isCustom, setIsCustom] = useState(false)
  const enableAnimations = useStore((s) => s.enableAnimations)
  const { status } = useWalletManager()
  const exchangeRates = useStore((s) => s.exchangeRates)

  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>(
    networkConfig?.displayCurrency,
  )

  const onInputChange = (value: number) => {
    setCustomSlippage(value.toString())
    if (!value.toString()) {
      return
    }
  }

  const onInputBlur = () => {
    setIsCustom(false)

    if (!customSlippage) {
      setCustomSlippage(inputPlaceholder)
      useStore.setState({ slippage })
      return
    }

    const value = Number(customSlippage || 0) / 100
    if (slippages.includes(value)) {
      setCustomSlippage(inputPlaceholder)
      useStore.setState({ slippage: value })
      return
    }

    useStore.setState({ slippage: new BigNumber(customSlippage).div(100).toNumber() })
  }

  const onInputFocus = () => {
    setIsCustom(true)
  }

  const changeReduceMotion = (reduce: boolean) => {
    useStore.setState({ enableAnimations: !reduce })
    localStorage.setItem(ENABLE_ANIMATIONS_KEY, reduce ? 'false' : 'true')
  }

  const changeDisplayCurrency = (denom: string) => {
    const selectedAsset = currencyAssets.find((asset) => asset.denom === denom)
    if (!selectedAsset || !networkConfig || !exchangeRates?.length) return
    const newDisplayCurrency = {
      denom: selectedAsset.denom,
      prefix: selectedAsset.prefix ?? '',
      suffix: selectedAsset.symbol ?? '',
      decimals: 2,
    }

    const exchangeRate = exchangeRates.find((rate) => rate.denom === newDisplayCurrency.denom)
    if (!exchangeRate) return
    setDisplayCurrency(newDisplayCurrency)
    useStore.setState({ networkConfig: { ...networkConfig, displayCurrency: newDisplayCurrency } })
    useStore.setState({ baseToDisplayCurrencyRatio: 1 / Number(exchangeRate.amount) })
    localStorage.setItem(DISPLAY_CURRENCY_KEY, JSON.stringify(newDisplayCurrency))
    queryClient.invalidateQueries()
  }

  if (status !== WalletConnectionStatus.Connected) return null

  return (
    <div className={styles.container}>
      <Button
        className={styles.button}
        variant='round'
        color='tertiary'
        suffix={<SVG.Settings />}
        onClick={() => setShowDetails(true)}
      />
      {showDetails && (
        <>
          <div className={styles.details}>
            <div className={styles.header}>
              <p className={styles.text}>{t('common.settings')}</p>
            </div>
            <div className={styles.settings}>
              <div className={`${styles.setting} ${styles.reduceMotion}`}>
                <div className={styles.name}>
                  {t('common.reduceMotion')}
                  <Tooltip content={t('common.tooltips.reduceMotion')} className={styles.tooltip} />
                </div>
                <div className={styles.content}>
                  <Toggle
                    name='reduceMotionToggle'
                    checked={!enableAnimations}
                    onChange={changeReduceMotion}
                  />
                </div>
              </div>
              <div className={styles.setting}>
                <div className={styles.name}>
                  {t('common.displayCurrency')}
                  <Tooltip
                    content={<Trans i18nKey='common.tooltips.displayCurrency' />}
                    className={styles.tooltip}
                  />
                </div>
                <div className={styles.content}>
                  <select
                    onChange={(e) => changeDisplayCurrency(e.target.value)}
                    className={classNames([styles.select, 's'])}
                    tabIndex={2}
                    value={displayCurrency.denom}
                  >
                    {currencyAssets.map((currency) => (
                      <option key={currency.denom} value={currency.denom}>
                        {`${currency.name} ${currency.symbol && `(${currency.symbol})`}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {FIELDS_FEATURE && (
              <>
                <div className={styles.header}>
                  <p className={styles.text}>{t('fields.settings')}</p>
                </div>
                <div className={styles.settings}>
                  <div className={styles.setting}>
                    <div className={styles.name}>
                      {t('common.slippage')}
                      <Tooltip content={t('fields.tooltips.slippage')} className={styles.tooltip} />
                    </div>
                    <div className={styles.content}>
                      {slippages.map((value) => (
                        <button
                          key={`slippage-${value}`}
                          onClick={() => {
                            useStore.setState({ slippage: value })
                          }}
                          className={classNames([
                            styles.button,
                            slippage === value && !isCustom ? styles.solid : '',
                          ])}
                        >
                          {value * 100}%
                        </button>
                      ))}
                      <button
                        onClick={() => inputRef?.current?.focus()}
                        className={classNames([
                          styles.button,
                          !slippages.includes(slippage) || isCustom ? styles.solid : '',
                        ])}
                      >
                        <NumberInput
                          onRef={setInputRef}
                          onChange={onInputChange}
                          onBlur={onInputBlur}
                          onFocus={onInputFocus}
                          value={customSlippage}
                          maxValue={10}
                          maxDecimals={1}
                          maxLength={3}
                          className={styles.customSlippageBtn}
                          style={{ fontSize: 16 }}
                        />
                        %
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className={styles.clickAway} onClick={() => setShowDetails(false)} role='button' />
        </>
      )}
    </div>
  )
}
