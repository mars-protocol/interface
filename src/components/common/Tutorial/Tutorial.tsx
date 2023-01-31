import Tippy from '@tippyjs/react'
import { Button, SVG } from 'components/common'
import { FIELDS_TUTORIAL_KEY, RED_BANK_TUTORIAL_KEY } from 'constants/appConstants'
import { formatValue, ltvToLeverage } from 'libs/parse'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './Tutorial.module.scss'

interface Props {
  children: ReactNode
  step: number
  className?: string
  type: 'fields' | 'redbank'
  availableVault?: Vault
}

export const Tutorial = (props: Props) => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const tutorialStep = useStore((s) => s.tutorialSteps[props.type])
  const setTutorialStep = useStore((s) => s.setTutorialStep)
  const [toggleClass, setToggleClass] = useState('')
  const showTutorial =
    props.type === 'fields'
      ? !localStorage.getItem(FIELDS_TUTORIAL_KEY) && !!props.availableVault
      : !localStorage.getItem(RED_BANK_TUTORIAL_KEY)

  const scrollRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tutorialStep !== props.step || !showTutorial) return
    if (scrollRef && window.innerWidth < 768) {
      const y = scrollRef.current?.getBoundingClientRect().bottom || 0
      const half = window.innerHeight / 4
      const scroll = y < half ? 0 : y - half
      window.scrollTo({ top: scroll, behavior: 'smooth' })
    }
    setIsVisible(true)
    const timer = setTimeout(() => {
      setToggleClass(styles.show)
    }, 50)
    return () => clearTimeout(timer)
  }, [tutorialStep, props.step, showTutorial])

  useEffect(() => {
    if (tutorialStep === props.step) return
    setToggleClass(styles.hide)
    const timer = setTimeout(() => setIsVisible(false), 1000)
    return () => clearTimeout(timer)
  }, [tutorialStep, props.step])

  const hideTutorial = () => {
    localStorage.setItem(
      props.type === 'fields' ? FIELDS_TUTORIAL_KEY : RED_BANK_TUTORIAL_KEY,
      'true',
    )
  }
  const handleButtonClick = () => {
    if (props.step === 3) hideTutorial()
    setTutorialStep(props.type)
  }

  const maxLeverage = props.availableVault
    ? formatValue(ltvToLeverage(props.availableVault?.ltv.max), 2, 2)
    : ''

  const content = (
    <>
      <div className={styles.header}>
        <p className='sCapsStrong'>{t(`${props.type}.tutorial.${props.step}.title`)}</p>
        <button
          onClick={() => {
            setIsVisible(false)
            setTutorialStep(props.type, 999)
            hideTutorial()
          }}
          className={styles.closeBtn}
        >
          <SVG.Close />
        </button>
      </div>
      <div className={styles.content}>
        <p className='s'>
          {t(`${props.type}.tutorial.${props.step}.description`, {
            leverage: maxLeverage,
          })}
        </p>
        <Button
          text={t(`${props.type}.tutorial.${props.step}.button`)}
          onClick={handleButtonClick}
          className={styles.btn}
        />
      </div>
    </>
  )
  return (
    <>
      <Tippy
        content={content}
        interactive={true}
        visible={isVisible && showTutorial}
        placement='bottom'
        animation='fade'
        className={`${styles.container} ${toggleClass}`}
      >
        <div ref={scrollRef} className={props.className}>
          {props.children}
        </div>
      </Tippy>
    </>
  )
}
