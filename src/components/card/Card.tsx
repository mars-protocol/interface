import { ReactNode } from 'react'
import styles from './Card.module.scss'

interface Props {
    children?: ReactNode
    styleOverride?: object
}

const Card = ({ children, styleOverride }: Props) => {
    return (
        <div style={styleOverride} className={styles.container}>
            {children}
        </div>
    )
}

export default Card
