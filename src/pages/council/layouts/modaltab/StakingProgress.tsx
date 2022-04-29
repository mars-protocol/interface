import moment from 'moment'
import { GradientValue } from '../../../../components/radialgauge/elements/ValueArc'
import RadialGauge from '../../../../components/radialgauge/RadialGauge'
import TxFee from '../../../../components/TxFee'
import styles from './StakingProgress.module.scss'
import { useTranslation } from 'react-i18next'
import { lookup, produceCountdown } from '../../../../libs/parse'
import { Claim } from '../../hooks/useCooldown'
import { useStaking } from '../../../../hooks/useStaking'
import { useMarsBalance } from '../../../../hooks/useMarsBalance'
import colors from '../../../../styles/_assets.module.scss'
import { XMARS_DECIMALS, XMARS_DENOM } from '../../../../constants/appConstants'
import Button from '../../../../components/Button'

interface Props {
    clickHandler: () => void
    submitted: boolean
    gasFeeFormatted: string
    showButton: boolean
    cooldown: Claim | undefined
    cooldownEnd: number
}

const StakingProgress = ({
    clickHandler,
    submitted,
    gasFeeFormatted,
    showButton,
    cooldown,
    cooldownEnd,
}: Props) => {
    const { t } = useTranslation()

    const { config } = useStaking()
    const { findBalance } = useMarsBalance()
    const { xMarsRatio } = useStaking()

    // --------------
    // STATES
    // --------------

    const currentTime = new Date().getTime()
    const cooldownDuration = Number(config?.cooldown_duration || 0) * 1000

    // ---------------
    // CALCULATE
    // ---------------

    const amountInCooldown = Number(cooldown?.amount)
    const xMarsBalance = Number(findBalance(XMARS_DENOM)?.amount)

    const timeLeft = cooldownEnd - currentTime

    const remaining = !cooldown
        ? cooldownDuration
        : timeLeft >= 0
        ? timeLeft
        : 0

    const percentageScaled = (remaining / cooldownDuration) * 100

    // ----------------
    // PRESENTATION
    // ----------------

    const generateTextView = () => {
        return (
            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: '84px',
                }}
            >
                <span className={`overline`}>{t('council.timeLeft')}</span>
                <span
                    style={{
                        textAlign: 'center',
                        alignSelf: 'center',
                    }}
                    className={`h3 ${styles.timeRemaining}`}
                >
                    {produceCountdown(remaining)}
                </span>
                <span className={`sub2`}>{t('council.daysHoursMinutes')}</span>
            </div>
        )
    }

    const colorStops = Array<GradientValue>()
    colorStops.push({ value: 0, color: colors.primary })
    colorStops.push({ value: 0.6, color: colors.secondary })

    return (
        <div className={styles.staking}>
            <div className={styles.radialGaugeContainer}>
                <RadialGauge
                    currentLtv={percentageScaled}
                    maxLtv={0}
                    maxValue={
                        cooldown
                            ? lookup(
                                  amountInCooldown / xMarsRatio,
                                  XMARS_DENOM,
                                  XMARS_DECIMALS
                              )
                            : lookup(xMarsBalance, XMARS_DENOM, XMARS_DECIMALS)
                    }
                    generateText={generateTextView}
                    showMaxValue={true}
                    colorStops={colorStops}
                    showDot={false}
                    maxTextPrefix={''}
                    maxTextTitle={'xMars'}
                />
            </div>

            <div className={styles.newCooldownContentWrapper}>
                <span className={`overline ${styles.newCooldownContent}`}>
                    {moment(cooldownEnd).isAfter()
                        ? t('council.cooldownDetails')
                        : t('council.cooldownFinished', {
                              mars: lookup(
                                  amountInCooldown,
                                  XMARS_DENOM,
                                  XMARS_DECIMALS
                              ),
                          })}
                </span>
            </div>

            <div
                style={{ visibility: showButton ? 'visible' : 'hidden' }}
                className={styles.buttonWrapper}
            >
                {timeLeft <= 0 ? (
                    <div>
                        <div className={styles.actionButton}>
                            <Button
                                showProgressIndicator={submitted}
                                text={
                                    cooldown
                                        ? moment(cooldownEnd).isAfter()
                                            ? t('council.cooldownInProgress')
                                            : t('council.unstakeNow')
                                        : t('council.startCooldown')
                                }
                                color='primary'
                                disabled={moment(cooldownEnd).isAfter()}
                                onClick={clickHandler}
                            />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <TxFee txFee={Number(gasFeeFormatted).toFixed(2)} />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default StakingProgress
