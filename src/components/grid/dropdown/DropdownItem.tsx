import { useHistory } from 'react-router'
import useActionButtonClickHandler from '../../../hooks/useActionButtonClickHandler'
import { DropdownItemProps } from '../../../types/components'
import styles from './DropdownItem.module.scss'

const DropdownItem = ({
    icon,
    title,
    denom,
    actionType,
    gridAction,
    url,
    close,
    strategy,
}: DropdownItemProps) => {
    const provideClickHandler = useActionButtonClickHandler()
    const history = useHistory()
    const clickHandler = strategy
        ? () => {
              history.push(`/fields/strategy/${strategy.key}`)
          }
        : provideClickHandler(actionType, denom, gridAction, url)

    return (
        <div
            className={styles.container}
            onClick={() => {
                clickHandler()
                close()
            }}
        >
            {icon}
            <span className='body2'>{title}</span>
        </div>
    )
}

export default DropdownItem
