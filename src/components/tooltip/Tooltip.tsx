import { ReactNode } from 'react'
import Tippy from '@tippyjs/react'

import HelpOutlineIcon from '@material-ui/icons/HelpOutline'

import styles from './Tooltip.module.scss'

interface TooltipProps {
    content: string | ReactNode
    iconWidth: string
}

const Tooltip = ({ content, iconWidth }: TooltipProps) => (
    <Tippy
        className='tippyContainer'
        content={<span className='body2'>{content}</span>}
        interactive={true}
        appendTo={() => document.body}
    >
        <HelpOutlineIcon style={{ width: iconWidth }} className={styles.info} />
    </Tippy>
)

export default Tooltip
