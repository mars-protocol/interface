import BigNumber from 'bignumber.js'
import classNames from 'classnames/bind'
import { InputSlider, Tutorial } from 'components/common'
import { FIELDS_TUTORIAL_KEY } from 'constants/appConstants'
import { formatValue, ltvToLeverage } from 'libs/parse'
import React from 'react'
import { useTranslation } from 'react-i18next'
import colors from 'styles/_assets.module.scss'

import styles from './LeverageSlider.module.scss'

interface Props {
  vault: Vault
  leverage: number
  leverageLimit: number
  leverageMax: number
  className?: string
  onChange: (leverage: number) => void
}

export const LeverageSlider = (props: Props) => {
  const { t } = useTranslation()
  const containerClasses = classNames([props.className, styles.container])
  const showTutorial = !localStorage.getItem(FIELDS_TUTORIAL_KEY)

  const slider = (
    <InputSlider
      enabled
      isLeverage
      value={props.leverage}
      maxValue={props.leverageMax}
      leverageMax={ltvToLeverage(props.vault.ltv.max)}
      leverageLimit={props.leverageLimit}
      onChange={props.onChange}
      sliderColor={colors.secondary}
    />
  )

  return (
    <div className={containerClasses}>
      <p className={styles.title}>
        <span className='sCaps'>
          {t('fields.leverage')}: {new BigNumber(props.leverage).toPrecision(3)}
        </span>
        <span className='xs'>x</span>
      </p>
      {showTutorial ? (
        <Tutorial step={2} type='fields' availableVault={props.vault}>
          {slider}
        </Tutorial>
      ) : (
        <>{slider}</>
      )}
      {props.leverage >= props.leverageLimit &&
        props.leverageLimit < ltvToLeverage(props.vault.ltv.max) && (
          <span className={styles.warning}>
            {t('fields.messages.unableToIncreaseLeverage', {
              leverage: formatValue(props.leverageLimit, 2, 2),
            })}
          </span>
        )}
    </div>
  )
}
