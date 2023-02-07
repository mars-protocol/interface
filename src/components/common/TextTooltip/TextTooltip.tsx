import Tippy from '@tippyjs/react'

import styles from './TextTooltip.module.scss'

interface Props {
  text: string | React.ReactNode
  tooltip: string | React.ReactNode
  hideUnderline?: boolean
  hideStyling?: boolean
}
export const TextTooltip = (props: Props) => {
  return (
    <Tippy
      appendTo={() => document.body}
      animation={false}
      delay={[400, 0]}
      render={(attrs) => {
        if (!props.tooltip) return null
        return (
          <div className={props.hideStyling ? '' : 'tippyContainer'} {...attrs}>
            {props.tooltip}
          </div>
        )
      }}
    >
      <span className={props.hideUnderline ? styles.pointer : styles.tooltip} style={{}}>
        {props.text}
      </span>
    </Tippy>
  )
}
