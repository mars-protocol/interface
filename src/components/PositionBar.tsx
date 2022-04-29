import Tippy from '@tippyjs/react'
import styles from './PositionBar.module.scss'
import colors from '../styles/_assets.module.scss'
import { formatValue, lookup } from '../libs/parse'
import CollectionHover, { HoverItem } from './CollectionHover'
import { ReactElement } from 'react'
import { UST_DECIMALS, UST_DENOM } from '../constants/appConstants'
import { useTranslation } from 'react-i18next'
const PositionBar = ({
    title,
    value,
    bars,
    total,
    compactView = false,
}: StrategyBarProps) => {
    const { t } = useTranslation()
    const produceData = (data: StrategyBarItem[]): HoverItem[] => {
        const items: HoverItem[] = []

        data.forEach((asset: StrategyBarItem) => {
            if (asset.value !== 0) {
                items.push({
                    color: asset.color || '',
                    name: t(`strategy.${asset.name}`) || '',
                    usdValue: lookup(asset.value, UST_DENOM, UST_DECIMALS),
                })
            }
        })
        return items
    }

    const renderBars = (bars: StrategyBarItem[]): ReactElement[] => {
        const barParts: ReactElement[] = []
        bars.forEach((item: StrategyBarItem, index: number) => {
            barParts.push(
                <div
                    key={index}
                    className={styles.fraction}
                    style={{
                        width:
                            item.value === 0
                                ? '0%'
                                : ((item.value / total) * 100).toFixed(2) + '%',
                        zIndex: 50 - index,
                        backgroundColor: item.color,
                    }}
                />
            )
        })

        return barParts
    }

    return (
        <div
            className={
                compactView
                    ? `${styles.position} ${styles.compact}`
                    : `${styles.position}`
            }
        >
            <div className={styles.container}>
                <div className={styles.value}>
                    <h4>
                        <span>$</span>
                        {formatValue(value)}
                    </h4>
                </div>
                <span className={'sub2'}>{title}</span>
            </div>
            {bars.length === 0 ? (
                <div className={styles.bar}>
                    <div
                        className={styles.fraction}
                        style={{
                            width: '33%',
                            zIndex: 50 - 1,
                            backgroundColor: colors.transparentWhite,
                        }}
                    />
                </div>
            ) : (
                <>
                    {!(bars.length === 1 && bars[0].value === 0) && (
                        <Tippy
                            className={styles.box}
                            content={
                                <CollectionHover
                                    title={title}
                                    data={produceData(bars)}
                                />
                            }
                        >
                            <div className={styles.bar}>{renderBars(bars)}</div>
                        </Tippy>
                    )}
                </>
            )}
        </div>
    )
}

export default PositionBar
