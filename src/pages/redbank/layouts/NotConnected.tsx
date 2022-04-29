import { useEffect, useState } from 'react'
import styles from './NotConnected.module.scss'
import { useRedBank, useExchangeRate } from '../../../hooks'
import Title from '../../../components/Title'
import Card from '../../../components/card/Card'
import Markets from './Markets'
import {
    notConnectedSupplyGridColumns,
    notConnectedSupplyGridInitialState,
    notConnectedBorrowGridColumns,
    notConnectedBorrowGridInitialState,
} from '../gridConfig'
import ConnectButton from '../../../components/header/ConnectButton'
import { Trans, useTranslation } from 'react-i18next'
import useStore from '../../../store'
import { DocURL } from '../../../types/enums/DocURL.enum'

const NotConnected = () => {
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const { findLiquidity, findMarketInfo } = useRedBank()
    const { exchangeToUusd } = useExchangeRate()
    const { t } = useTranslation()
    const [supplyMarketsGridData, setSupplyData] = useState<AssetInfo[]>([])
    const [borrowMarketsGridData, setBorrowData] = useState<AssetInfo[]>([])

    useEffect(() => {
        let supplyData: AssetInfo[] = []
        let borrowData: AssetInfo[] = []
        if (!whitelistedAssets?.length) return
        whitelistedAssets.forEach((asset) => {
            const reserveInfo = findMarketInfo(asset.denom)
            const depositApy = reserveInfo?.liquidity_rate || 0
            const borrowApy = reserveInfo?.borrow_rate || 0
            const liquidity = findLiquidity(asset.denom)

            supplyData.push({
                ...asset,
                apy: depositApy * 100,
            })

            borrowData.push({
                ...asset,
                apy: borrowApy * 100,
                liquidity: liquidity?.amount.toString(),
                uusdLiquidity: exchangeToUusd(liquidity),
            })
        })

        setSupplyData(supplyData)
        setBorrowData(borrowData)
    }, [findLiquidity, findMarketInfo, exchangeToUusd, whitelistedAssets])

    return (
        <div className={styles.notConnected}>
            <div className={styles.welcome}>
                <div className={styles.title}>
                    {t('redbank.welcomeToTheRedBank')}
                </div>
                <div className={styles.subTitle}>
                    {t('redbank.lendAndBorrowMoney')}
                </div>
                <div className={styles.desc}>
                    <div>{t('common.youveArrivedOnMars')}</div>
                    <div>
                        <Trans i18nKey='redbank.readMoreAboutMarsOrLearnHowToUseTheRedBank'>
                            <a
                                href={DocURL.LANDING}
                                target='_blank'
                                rel='noreferrer'
                            >
                                Read more about Mars
                            </a>
                            &nbsp; or &nbsp;
                            <a
                                href={DocURL.RED_BANK}
                                target='_blank'
                                rel='noreferrer'
                            >
                                learn how to use the Red Bank.
                            </a>
                        </Trans>
                    </div>
                </div>
                <ConnectButton color={'secondary'} />
            </div>

            <Title text={t('common.theMarkets')} />

            <div className={styles.grids}>
                <Card>
                    <Markets
                        title={t('redbank.depositMarkets')}
                        columns={notConnectedSupplyGridColumns}
                        data={supplyMarketsGridData}
                        initialState={notConnectedSupplyGridInitialState}
                        tooltip={t(
                            'redbank.redBankMarketsDepositedNotConnectedTooltip'
                        )}
                    />
                </Card>

                <Card>
                    <Markets
                        title={t('redbank.borrowMarkets')}
                        columns={notConnectedBorrowGridColumns}
                        data={borrowMarketsGridData}
                        initialState={notConnectedBorrowGridInitialState}
                        tooltip={t(
                            'redbank.redbankMarketsBorrowedNotConnectedTooltip'
                        )}
                    />
                </Card>
            </div>
        </div>
    )
}

export default NotConnected
