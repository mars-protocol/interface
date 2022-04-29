import Card from '../../../components/card/Card'
import styles from './NotConnected.module.scss'
import Portfolio from './Portfolio'
import Tooltip from '../../../components/tooltip/Tooltip'
import { dummySupplyData, dummyBorrowData } from '../dummyMyStationData'
import ConnectButton from '../../../components/header/ConnectButton'
import { Trans, useTranslation } from 'react-i18next'
import { DocURL } from '../../../types/enums/DocURL.enum'

const NotConnected = () => {
    const { t } = useTranslation()
    return (
        <div className={styles.notConnected}>
            <div className={styles.unclaimedTerritoryWrapper}>
                <Card styleOverride={{ width: '100%' }}>
                    <div className={styles.unclaimedTerritory}>
                        <span className={styles.title}>
                            {t('mystation.unclaimedTerritory')}
                        </span>
                        <span className={styles.subtitle}>
                            {t('mystation.thisCouldBeYourFutureStation')}
                        </span>
                        <div className={styles.infoWrapper}>
                            <span className={`body ${styles.info}`}>
                                {t('common.youveArrivedOnMars')}
                            </span>
                            <span className={styles.infoLinksWrapper}>
                                <Trans i18nKey='mystation.readMoreAboutMarsOrLearnHowToUseMyStation'>
                                    <a
                                        href={DocURL.LANDING}
                                        target='_blank'
                                        rel='noreferrer'
                                        className={styles.infoLink}
                                    >
                                        Read more about Mars
                                    </a>
                                    &nbsp; or &nbsp;
                                    <a
                                        href={DocURL.RED_BANK}
                                        target='_blank'
                                        rel='noreferrer'
                                        className={styles.infoLink}
                                    >
                                        learn how to use my Station.
                                    </a>
                                </Trans>
                            </span>
                            <span className={styles.info}>
                                {t(
                                    'mystation.claimYourTerritoryByConnectingYourWallet'
                                )}
                            </span>
                        </div>
                        <ConnectButton color={'secondary'} />
                    </div>
                </Card>
            </div>
            <div className={styles.portforlioWrapper}>
                <Card>
                    <div className={styles.summary}>
                        <Portfolio
                            maxBorrow={8000000000}
                            supplyMarketsData={dummySupplyData}
                            borrowMarketsData={dummyBorrowData}
                            showDetailsClickHandler={() => {}}
                            isDummy={true}
                        />
                        <div className={styles.tooltip}>
                            <Tooltip
                                content={t('redbank.redBankTooltip')}
                                iconWidth={'18px'}
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default NotConnected
