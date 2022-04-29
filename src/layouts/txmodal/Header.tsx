import styles from './Header.module.scss'

import Tooltip from '../../components/tooltip/Tooltip'
import { ArrowBackSVG, CloseSVG } from '../../components/Svg'
import { ReactNode } from 'react'
interface Props {
    handleClose?: () => void
    titleText: string
    exitText?: string
    src?: string
    underline?: boolean
    tooltip: string | ReactNode
    buttons?: ReactNode[]
}

const Header = ({
    titleText,
    handleClose = () => {},
    exitText = '',
    src = '',
    underline = true,
    tooltip,
    buttons,
}: Props) => {
    return (
        <div
            className={
                underline
                    ? styles.header
                    : `${styles.header} ${styles.noUnderline}`
            }
        >
            <div className={styles.close} onClick={handleClose}>
                {src ? (
                    <div className={styles.button}>
                        {src === 'back' ? <ArrowBackSVG /> : <CloseSVG />}
                    </div>
                ) : null}
                <span onClick={handleClose} className={'overline'}>
                    {exitText}
                </span>
            </div>
            <div className={`h6 ${styles.title}`}>{titleText}</div>
            {buttons?.length && buttons.length > 0 ? (
                <div className={styles.buttons}>
                    {buttons?.map((button) => button)}
                </div>
            ) : null}
            <div className={styles.tooltip}>
                <Tooltip content={tooltip} iconWidth={'18px'} />
            </div>
        </div>
    )
}

export default Header
