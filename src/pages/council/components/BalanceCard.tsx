import { formatValue } from '../../../libs/parse'
import Tooltip from '../../../components/tooltip/Tooltip'

import styles from './BalanceCard.module.scss'

interface Props {
    title: string
    value: number
    prefix: string
    suffix: string
    useDecimals?: boolean
    toolTip?: string
}
const BalanceCard = ({
    title,
    value,
    prefix,
    suffix,
    useDecimals = true,
    toolTip = '',
}: Props) => {
    return (
        <div className={styles.container}>
            {toolTip ? (
                <div className={styles.tooltip}>
                    <Tooltip content={toolTip} iconWidth={'18px'} />
                </div>
            ) : null}

            <div className={styles.value}>
                <span>{prefix}</span>
                <span className='h4'>
                    {formatValue(
                        value,
                        useDecimals ? 2 : 0,
                        useDecimals ? 2 : 0,
                        true,
                        false,
                        true
                    )}
                </span>
                <span>{suffix}</span>
            </div>
            <span className={`sub2 ${styles.title} `}>{title}</span>
        </div>
    )
}

export default BalanceCard
