import Apy from '../components/Apy'
import BalanceCard from '../components/BalanceCard'
import styles from './Summary.module.scss'
import { useMarsBalance, useStaking, useVesting } from '../../../hooks/'
import { lookup, formatCooldown } from '../../../libs/parse'
import {
    MARS_DECIMALS,
    MARS_DENOM,
    XMARS_DECIMALS,
    XMARS_DENOM,
} from '../../../constants/appConstants'
import Card from '../../../components/card/Card'
import { useTranslation } from 'react-i18next'
import { useCooldown } from '../hooks/useCooldown'
import Tooltip from '../../../components/tooltip/Tooltip'

interface Props {
    stakeButtonClickHandler: () => void
    unstakeButtonClickHandler: () => void
}

const Summary = ({
    stakeButtonClickHandler,
    unstakeButtonClickHandler,
}: Props) => {
    const { t } = useTranslation()
    const { findBalance } = useMarsBalance()
    const { claim } = useCooldown()
    const { config, apy } = useStaking()
    const { votingPowerAt } = useVesting()

    const marsTokenBalance = Number(findBalance(MARS_DENOM)?.amount || 0)
    const xMarsTokenBalance = Number(findBalance(XMARS_DENOM)?.amount || 0)
    const cooldownTime =
        config?.cooldown_duration && formatCooldown(config.cooldown_duration)

    return (
        <Card styleOverride={{ position: 'relative' }}>
            <div className={styles.tooltip}>
                <Tooltip
                    content={t('council.governanceOverviewTooltip', {
                        time: cooldownTime,
                    })}
                    iconWidth={'18px'}
                />
            </div>
            <div className={styles.summary}>
                <div className={styles.header}>
                    <div className={styles.horizontalLine} />
                    <h6>{t('global.governance')}</h6>
                    <div className={styles.horizontalLine} />
                </div>
                <div className={styles.container}>
                    <div className={styles.balanceCardContainer}>
                        <BalanceCard
                            title={t('council.myStakeableMars')}
                            value={lookup(
                                marsTokenBalance,
                                MARS_DENOM,
                                MARS_DECIMALS
                            )}
                            prefix={''}
                            suffix={' MARS'}
                        />
                    </div>

                    <Apy
                        stakeClick={stakeButtonClickHandler}
                        unstakeClick={unstakeButtonClickHandler}
                        showUnstakeButton={
                            xMarsTokenBalance > 0 ||
                            (claim !== null && claim !== undefined)
                        }
                        apy={apy}
                    />

                    <div className={styles.balanceCardContainer}>
                        <div>
                            <BalanceCard
                                title={t('council.myStakedMars')}
                                value={lookup(
                                    xMarsTokenBalance,
                                    XMARS_DENOM,
                                    XMARS_DECIMALS
                                )}
                                prefix={''}
                                suffix={' xMARS'}
                            />
                            {votingPowerAt && Number(votingPowerAt) > 0 && (
                                <div className={styles.vestedMarsContainer}>
                                    <BalanceCard
                                        title={t('council.myVestedMars')}
                                        value={lookup(
                                            Number(votingPowerAt) || 0,
                                            XMARS_DENOM,
                                            XMARS_DECIMALS
                                        )}
                                        prefix={''}
                                        suffix={' xMARS'}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default Summary
