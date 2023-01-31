import { Tooltip } from 'components/common'
import { useMemo } from 'react'

import { EditContent } from './components/EditContent'
import { RepayContent } from './components/RepayContent'
import { UnlockContent } from './components/UnlockContent'

interface Props {
  type: 'edit' | 'repay' | 'unlock'
  vault: Vault
  position: Position
  prevPosition?: Position
  repayAmount?: number
  className?: string
}
export const ActionsTooltip = (props: Props) => {
  const tooltipContent = useMemo(() => {
    switch (props.type) {
      case 'edit':
        return (
          <EditContent
            vault={props.vault}
            position={props.position}
            prevPosition={props.prevPosition}
          />
        )
      case 'unlock':
        if (!props.prevPosition) return null
        return <UnlockContent vault={props.vault} position={props.prevPosition} />
      case 'repay':
        return <RepayContent vault={props.vault} repayAmount={props.repayAmount || 0} />
    }
  }, [props.type, props.position, props.prevPosition, props.vault, props.repayAmount])

  return (
    <Tooltip
      content={<ol style={{ paddingLeft: '16px' }}>{tooltipContent}</ol>}
      className={props.className}
    />
  )
}
