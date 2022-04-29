import { useState } from 'react'
import Tippy, { TippyProps } from '@tippyjs/react'
import DropdownItem from './DropdownItem'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'

import styles from './OverflowDropdown.module.scss'
import { DropdownItemProps } from '../../../types/components'
import Button from '../../Button'

export const DefaultTippyProps: TippyProps = {
    animation: false,
    interactive: true,
    appendTo: document.body,
}

export const DropdownTippyProps: TippyProps = {
    ...DefaultTippyProps,
    placement: 'bottom-end',
}

interface OverflowDropdownProps {
    menuItems: DropdownItemProps[]
    denom: string
    strategy?: StrategyObject
    disabled?: boolean
}

const OverflowDropdown = ({
    menuItems,
    denom,
    strategy,
    disabled = false,
}: OverflowDropdownProps) => {
    const [visible, setVisible] = useState(false)
    const show = () => setVisible(true)
    const hide = () => setVisible(false)
    const renderDropdown = () => (
        <div className={styles.container}>
            {menuItems.map((menuItem, index) => (
                <DropdownItem
                    key={index}
                    icon={menuItem.icon}
                    title={menuItem.title}
                    denom={denom}
                    actionType={menuItem.actionType}
                    gridAction={menuItem.gridAction}
                    url={menuItem.url}
                    close={hide}
                    strategy={strategy}
                />
            ))}
        </div>
    )

    if (menuItems.length) {
        return (
            <div>
                <Tippy
                    {...DropdownTippyProps}
                    render={renderDropdown}
                    visible={visible}
                    onClickOutside={hide}
                >
                    <div className={styles.buttonContainer}>
                        <Button
                            color='tertiary'
                            variant='round'
                            prefix={
                                <MoreHorizIcon
                                    style={{
                                        width: '1.2rem',
                                        height: '1.2rem',
                                    }}
                                />
                            }
                            onClick={visible ? hide : show}
                            disabled={disabled}
                        />
                    </div>
                </Tippy>
            </div>
        )
    } else {
        return null
    }
}

export default OverflowDropdown
