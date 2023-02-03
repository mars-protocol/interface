import { useWalletManager, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Button, NumberInput, SVG, Toggle, Tooltip } from 'components/common'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './Settings.module.scss'

export const Settings = () => {
  const { t } = useTranslation()
  const inputPlaceholder = '...'

  const slippages = [0.02, 0.03]
  const [showDetails, setShowDetails] = useState(false)
  const slippage = useStore((s) => s.slippage)
  const [customSlippage, setCustomSlippage] = useState<string>(inputPlaceholder)
  const [inputRef, setInputRef] = useState<React.RefObject<HTMLInputElement>>()
  const [isCustom, setIsCustom] = useState(false)
  const enableAnimations = useStore((s) => s.enableAnimations)
  const { status } = useWalletManager()

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
    localStorage.setItem('enableAnimations', reduce ? 'false' : 'true')
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
              <div className={styles.setting}>
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
            </div>

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
                    />
                    %
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.clickAway} onClick={() => setShowDetails(false)} role='button' />
        </>
      )}
    </div>
  )
}
