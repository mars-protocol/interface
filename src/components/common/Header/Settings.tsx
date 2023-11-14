import { useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Button, NumberInput, SVG, Toggle, Tooltip } from 'components/common'
import { DISPLAY_CURRENCY_KEY, ENABLE_ANIMATIONS_KEY } from 'constants/appConstants'
import React, { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import useStore from 'store'
import { State } from 'types/enums'

import styles from './Settings.module.scss'

export const Settings = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const slippages = [0.02, 0.03]
  const [showDetails, setShowDetails] = useState(false)
  const slippage = useStore((s) => s.slippage)
  const networkConfig = useStore((s) => s.networkConfig)
  const currencyAssets = networkConfig.assets.currencies
  const calculateExchangeRates = useStore((s) => s.calculateExchangeRates)
  const [customSlippage, setCustomSlippage] = useState<number>(0)
  const [inputRef, setInputRef] = useState<React.RefObject<HTMLInputElement>>()
  const [isCustom, setIsCustom] = useState(false)
  const enableAnimations = useStore((s) => s.enableAnimations)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const userWalletAddress = useStore((s) => s.userWalletAddress)

  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>(
    networkConfig.displayCurrency,
  )

  const onInputChange = (value: number) => {
    value = value / 100
    setCustomSlippage(value)
    if (!value.toString()) {
      return
    }
  }

  const onInputBlur = () => {
    setIsCustom(false)

    if (!customSlippage) {
      setCustomSlippage(0)
      useStore.setState({ slippage })
      return
    }

    const value = Number(customSlippage || 0) / 100
    if (slippages.includes(value)) {
      setCustomSlippage(0)
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
    if (!selectedAsset || !exchangeRates?.length) return
    const newDisplayCurrency = {
      denom: selectedAsset.denom,
      prefix: selectedAsset.prefix ?? '',
      suffix: selectedAsset.symbol ?? '',
      decimals: 2,
    }

    const exchangeRate = exchangeRates.find((rate) => rate.denom === newDisplayCurrency.denom)
    if (!exchangeRate && newDisplayCurrency.denom !== 'usd') return
    setDisplayCurrency(newDisplayCurrency)
    useStore.setState({
      networkConfig: { ...networkConfig, displayCurrency: newDisplayCurrency },
      exchangeRates: [],
      exchangeRatesState: State.INITIALISING,
    })
    localStorage.setItem(DISPLAY_CURRENCY_KEY, JSON.stringify(newDisplayCurrency))
    queryClient.invalidateQueries()
    calculateExchangeRates()
  }

  useEffect(() => {
    if (networkConfig.displayCurrency && networkConfig.displayCurrency !== displayCurrency)
      setDisplayCurrency(networkConfig.displayCurrency)
  }, [networkConfig.displayCurrency, displayCurrency])

  if (!userWalletAddress) return null

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
            {networkConfig.isFieldsEnabled && (
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
                          value={customSlippage * 100}
                          maxValue={10}
                          maxDecimals={1}
                          maxLength={3}
                          className={styles.customSlippageBtn}
                          style={{ fontSize: 16 }}
                          decimals={2}
                          placeholder='...'
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
