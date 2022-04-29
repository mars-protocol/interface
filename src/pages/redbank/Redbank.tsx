/* eslint-disable jsx-a11y/anchor-is-valid */
import Card from '../../components/card/Card'
import Title from '../../components/Title'
import Portfolio from './layouts/Portfolio'
import Markets from './layouts/Markets'
import { useAirdrop, useRedBank } from '../../hooks'
import { formatValue, lookup } from '../../libs/parse'

import {
    supplyGridColumns,
    supplyGridInitialState,
    borrowGridColumns,
    borrowGridInitialState,
} from './gridConfig'

import {
    ltvWeightedDepositValue,
    balanceSum,
    maintainanceMarginWeightedDepositValue,
} from '../../libs/assetInfo'
import styles from './Redbank.module.scss'
import Notification from '../../components/Notification'
import { Trans, useTranslation } from 'react-i18next'
import { useAssetGrid } from '../../hooks/useAssetGrid'
import { Route, Switch } from 'react-router'
import RedbankAction from '../../layouts/txmodal/RedbankAction'
import { NotificationType, ViewType } from '../../types/enums'
import { UST_DECIMALS, UST_DENOM } from '../../constants/appConstants'
import useStore from '../../store'
import { DocURL } from '../../types/enums/DocURL.enum'

const Redbank = () => {
    const { t } = useTranslation()
    const { findMarketInfo, findUserAssetCollateral } = useRedBank()
    const { getAirdropBalance } = useAirdrop()
    const setIsRewardCenterOpen = useStore((s) => s.setIsRewardCenterOpen)

    const { supplyMarketsGridData, borrowMarketsGridData } = useAssetGrid()

    const depositBalance = Number(
        formatValue(
            lookup(balanceSum(supplyMarketsGridData), UST_DENOM, UST_DECIMALS),
            2,
            2,
            false,
            false,
            false
        )
    )
    const borrowBalance = balanceSum(borrowMarketsGridData)

    const maxBorrowLimit = ltvWeightedDepositValue(
        supplyMarketsGridData,
        findMarketInfo,
        findUserAssetCollateral
    )

    const liquidationThreshold = maintainanceMarginWeightedDepositValue(
        supplyMarketsGridData,
        findMarketInfo,
        findUserAssetCollateral
    )

    const dustLimit = (denom?: string) =>
        !denom || denom === 'uusd' ? 500 : 5000
    const depositsActiveDataFilter = (asset: AssetInfo) =>
        Number(asset.balance) > dustLimit(asset.denom) ||
        Number(asset.wallet) > dustLimit(asset.denom)
    const borrowedActiveDataFilter = (asset: AssetInfo) =>
        Number(asset.balance) > dustLimit(asset.denom)
    const showAirdropNotification = getAirdropBalance() > 0

    const maxLtvExceeded = (
        <Trans i18nKey='redbank.youAreGettingCloserToGettingLiquidated'>
            text
            <a
                className={styles.notificationLink}
                href={DocURL.RED_BANK}
                target='_blank'
                rel='noreferrer'
            >
                Learn more.
            </a>
        </Trans>
    )
    const supplyNotInvestedMessage = (
        <div className={styles.notInvested}>
            <div className='overline'>
                {t('redbank.youDontHaveAnyAssetsInYourWallet')}
            </div>
            <div className='body2'>
                <Trans i18nKey='redbank.buyAssetsFirstToBeAbleToDeposit'>
                    Buy assets first to be able to deposit them. &nbsp;
                    <a
                        className={styles.notInvestedLink}
                        href={DocURL.TUTORIAL_FUND_WALLET}
                        target='_blank'
                        rel='noreferrer'
                    >
                        Learn how
                    </a>
                </Trans>
            </div>
        </div>
    )
    const borrowNotInvestedMessage = (
        <div className={styles.notInvested}>
            <div className='overline'>
                {t('redbank.youDontHaveBorrowedOrDepositedAnyAsset')}
            </div>
            <div className='body2'>
                <Trans i18nKey='redbank.buyAssetsFirstToBeAbleToBorrow'>
                    Buy assets first, then deposit to be able to borrow. &nbsp;
                    <a
                        className={styles.notInvestedLink}
                        href={DocURL.TUTORIAL_FUND_WALLET}
                        target='_blank'
                        rel='noreferrer'
                    >
                        Learn how
                    </a>
                </Trans>
            </div>
        </div>
    )

    const airdropClaimNotification = (
        <Trans i18nKey='incentives.airdropClaimNotification'>
            text
            <a
                className={styles.notificationLink}
                onClick={() => setIsRewardCenterOpen(true)}
            >
                link
            </a>
            text
        </Trans>
    )
    const showLiquidationWarning =
        borrowBalance >= maxBorrowLimit && borrowBalance > 0

    return (
        <div className={styles.markets}>
            <Switch>
                <Route exact={true} path='/redbank'>
                    <Notification
                        showNotification={showLiquidationWarning}
                        type={NotificationType.Warning}
                        content={maxLtvExceeded}
                    />
                    <Notification
                        showNotification={showAirdropNotification}
                        type={NotificationType.Info}
                        content={airdropClaimNotification}
                    />

                    <div className={styles.summaryContainer}>
                        <Card>
                            <div className={styles.summary}>
                                <Portfolio
                                    depositBalance={depositBalance}
                                    borrowBalance={borrowBalance}
                                    borrowLimit={maxBorrowLimit}
                                    liquidationThreshold={liquidationThreshold}
                                />
                            </div>
                        </Card>
                    </div>

                    <Title text={t('common.theMarkets')} />

                    <div className={styles.grids}>
                        <Card>
                            <Markets
                                title={t('redbank.myDeposits')}
                                hideNotInvested={false}
                                notInvestedMessage={supplyNotInvestedMessage}
                                separator={t('common.notInYourWallet')}
                                columns={supplyGridColumns}
                                data={supplyMarketsGridData}
                                initialState={supplyGridInitialState}
                                activeDataFilter={depositsActiveDataFilter}
                                tooltip={t(
                                    'redbank.redBankMarketsDepositedTooltip'
                                )}
                            />
                        </Card>

                        <Card>
                            <Markets
                                title={t('redbank.myBorrowings')}
                                hideNotInvested={false}
                                notInvestedMessage={borrowNotInvestedMessage}
                                separator={t('redbank.notBorrowedYet')}
                                columns={borrowGridColumns}
                                data={borrowMarketsGridData}
                                initialState={borrowGridInitialState}
                                activeDataFilter={borrowedActiveDataFilter}
                                tooltip={t(
                                    'redbank.redbankMarketsBorrowedTooltip'
                                )}
                            />
                        </Card>
                    </div>
                </Route>

                <Route exact={false} path='/redbank/withdraw/:denom'>
                    <RedbankAction activeView={ViewType.Withdraw} />
                </Route>
                <Route exact={false} path='/redbank/deposit/:denom'>
                    <RedbankAction activeView={ViewType.Deposit} />
                </Route>
                <Route exact={false} path='/redbank/borrow/:denom'>
                    <RedbankAction activeView={ViewType.Borrow} />
                </Route>
                <Route exact={false} path='/redbank/repay/:denom'>
                    <RedbankAction activeView={ViewType.Repay} />
                </Route>
            </Switch>
        </div>
    )
}

export default Redbank
