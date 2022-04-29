import BorrowLimit from '../../../components/borrowlimit/BorrowLimit'
import BalanceCard from '../components/BalanceCard'
import { lookup } from '../../../libs/parse'
import styles from './Portfolio.module.scss'
import { useTranslation } from 'react-i18next'
import { UST_DECIMALS, UST_DENOM } from '../../../constants/appConstants'
import Tooltip from '../../../components/tooltip/Tooltip'

interface Props {
    depositBalance: number
    borrowBalance: number
    borrowLimit: number
    liquidationThreshold: number
}

const Portfolio = ({
    depositBalance,
    borrowBalance,
    borrowLimit,
    liquidationThreshold,
}: Props) => {
    const { t } = useTranslation()
    return (
        <div className={styles.portfolio}>
            <div className={styles.tooltip}>
                <Tooltip
                    content={t('redbank.redbankPortfolioTooltip')}
                    iconWidth={'18px'}
                />
            </div>
            <div className={styles.header}>
                <h6>{t('common.portfolio')}</h6>
            </div>
            <div className={styles.container}>
                <BalanceCard
                    title={t('redbank.myDepositBalance')}
                    value={depositBalance}
                />
                <div className={styles.borrowLimit}>
                    <BorrowLimit
                        width={'434px'}
                        ltv={borrowBalance}
                        maxLtv={borrowLimit}
                        liquidationThreshold={liquidationThreshold}
                        barHeight={'22px'}
                        showPercentageText={true}
                        showTitleText={true}
                        title={t('common.borrowingCapacity')}
                    />
                </div>
                <BalanceCard
                    title={t('redbank.myBorrowBalance')}
                    value={lookup(borrowBalance, UST_DENOM, UST_DECIMALS)}
                    alignRight={true}
                />
            </div>
        </div>
    )
}

export default Portfolio
