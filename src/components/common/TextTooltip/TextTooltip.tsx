import Tippy from '@tippyjs/react'

interface Props {
  text: string
  tooltip: string
}
export const TextTooltip = (props: Props) => {
  return (
    <Tippy
      appendTo={() => document.body}
      animation={false}
      render={(attrs) => {
        return (
          <div className='tippyContainer' {...attrs}>
            {props.tooltip}
          </div>
        )
      }}
    >
      <div>{props.text}</div>
    </Tippy>
  )
}
