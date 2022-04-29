import Card from '../../../components/card/Card'
import { useAccountBalanceState } from '../../../hooks/useAccountBalance'
import { formatValue, lookup } from '../../../libs/parse'
import BalanceCard from '../components/BalanceCard'
import {
    MARS_DECIMALS,
    MARS_DENOM,
    UST_DECIMALS,
    UST_DENOM,
} from '../../../constants/appConstants'
import { useProposals } from '../hooks/useProposals'
import styles from './Details.module.scss'
import {
    useAddressProvider,
    useRedBank,
    useStaking,
    useVesting,
} from '../../../hooks'
import { useTranslation } from 'react-i18next'

const Details = () => {
    const { t } = useTranslation()
    const { findMarketInfo } = useRedBank()
    const { config } = useAddressProvider()
    const { participationRate } = useProposals()
    // todo fix this so that we don't have to passs in reserve info. Also see this card
    const { find } = useAccountBalanceState(
        config?.safety_fund_address || '',
        findMarketInfo
    )
    const { proposalCount } = useProposals()
    const { marsInStakingNow } = useStaking()
    const { totalVotingPowerAt } = useVesting()
    const totalStaked = marsInStakingNow + Number(totalVotingPowerAt)

    return (
        <Card>
            <div className={styles.container}>
                <div className={styles.balanceCardContainer}>
                    <BalanceCard
                        title={t('council.totalStaked')}
                        value={lookup(totalStaked, MARS_DENOM, MARS_DECIMALS)}
                        prefix={''}
                        suffix={' MARS'}
                        toolTip={t('council.totalStakedTooltip', {
                            vestedMars: formatValue(
                                lookup(
                                    Number(totalVotingPowerAt) || 0,
                                    MARS_DENOM,
                                    MARS_DECIMALS
                                ),
                                0,
                                2
                            ),
                        })}
                    />
                </div>
                {/* 
                <div className={styles.balanceCardContainer}>
                    <BalanceCard
                        title={t('council.stakingRatio')}
                        // TODO marsInStackingNow should include mars in the vesting contracts... marsSupply should be circulating not total
                        value={(marsInStakingNow / marsSupply) * 100}
                        prefix={''}
                        suffix={'%'}
                        toolTip={t('council.stakingRatioTooltip')}
                    />
                </div> */}

                <div className={styles.balanceCardContainer}>
                    <BalanceCard
                        title={t('council.totalProposals')}
                        value={proposalCount}
                        prefix={''}
                        suffix={''}
                        useDecimals={false}
                        toolTip={t('council.totalProposalsTooltip')}
                    />
                </div>

                <div className={styles.balanceCardContainer}>
                    <BalanceCard
                        title={t('council.averageParticipation')}
                        value={
                            participationRate >= 0.01 ? participationRate : 0
                        }
                        prefix={''}
                        suffix={'%'}
                        toolTip={t('council.averageParticipationTooltip')}
                    />
                </div>

                <div className={styles.balanceCardContainer}>
                    <BalanceCard
                        title={t('fields.safetyFund')}
                        value={lookup(
                            Number(find(UST_DENOM)?.amount || 0),
                            UST_DENOM,
                            UST_DECIMALS
                        )}
                        prefix={''}
                        suffix={' UST'}
                        toolTip={t('fields.safetyFundTooltip')}
                    />
                </div>
            </div>
        </Card>
    )
}

export default Details
