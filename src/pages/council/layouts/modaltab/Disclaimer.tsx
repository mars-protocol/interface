import { useTranslation } from 'react-i18next'
import Header from '../../../../layouts/txmodal/Header'
import styles from './Disclaimer.module.scss'
import marsImage from '../../../../images/mars-grey.svg'
import { ViewType } from '../../../../types/enums'
import { useStaking } from '../../../../hooks/useStaking'
import { formatCooldown } from '../../../../libs/parse'
import Button from '../../../../components/Button'
import { DocURL } from '../../../../types/enums/DocURL.enum'

interface Props {
    handleClose: () => void
    hideDisclaimer: () => void
    setDontShowAgain: (dontShowAgain: boolean) => void
    dontShowAgain: boolean
    activeView: ViewType.Stake | ViewType.Unstake
}
const Disclaimer = ({
    handleClose,
    hideDisclaimer,
    setDontShowAgain,
    dontShowAgain,
    activeView,
}: Props) => {
    const { t } = useTranslation()
    const { config } = useStaking()

    const cooldownTime =
        config?.cooldown_duration && formatCooldown(config.cooldown_duration)

    return (
        <div className={styles.container}>
            <Header
                src={'back'}
                handleClose={handleClose}
                titleText={t('error.importantInformation')}
                tooltip={
                    activeView === ViewType.Stake
                        ? t('council.stakingMarsDisclaimerTooltip')
                        : t('council.unstakingMarsDisclaimerTooltip')
                }
            />
            <div className={styles.importantInformation}>
                <div className={styles.imageContainer}>
                    <img alt={'marsImage'} src={marsImage} />
                    <span className={styles.imageTitle}>
                        Staking{' '}
                        <span className={styles.imageTitleEmphasis}>Mars</span>
                    </span>
                </div>
                <span className={`body ${styles.content}`}>
                    {activeView === ViewType.Stake
                        ? t('council.firstStakeDisclaimer')
                        : t('council.firstUnstakeDisclaimer', {
                              time: cooldownTime,
                          })}
                    {activeView === ViewType.Unstake && (
                        <div className={styles.learnMore}>
                            <a
                                href={DocURL.STAKING_XMARS}
                                target='_blank'
                                rel='noreferrer'
                                className={styles.link}
                            >
                                Learn more
                            </a>
                        </div>
                    )}
                </span>
            </div>
            <div className={styles.buttonWrapper}>
                <div className={styles.understoodButton}>
                    <Button
                        color='primary'
                        text={t('council.dismissDisclaimer')}
                        onClick={hideDisclaimer}
                    />
                </div>
                <div className={styles.tickWrapper}>
                    <input
                        className={styles.check}
                        type='checkbox'
                        id='vehicle1'
                        name='vehicle1'
                        value='Bike'
                        checked={dontShowAgain}
                        onChange={() => setDontShowAgain(!dontShowAgain)}
                    />
                    <span className={`body`}>
                        {t('council.firstStakeDismiss')}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Disclaimer
