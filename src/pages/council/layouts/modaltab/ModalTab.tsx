import InputSection from '../../../../layouts/txmodal/tab/components/InputSection'
import styles from './ModalTab.module.scss'
import {
    formatValue,
    lookup,
    lookupSymbol,
    magnify,
} from '../../../../libs/parse'
import Button from '../../../../components/Button'
import { ModalActionButton } from '../Stake'
import { useMarsBalance } from '../../../../hooks/useMarsBalance'
import { useStaking } from '../../../../hooks/useStaking'
import ConnectButton from '../../../../components/header/ConnectButton'
import { useTranslation } from 'react-i18next'
import { ViewType } from '../../../../types/enums'
import {
    MARS_DENOM,
    XMARS_DECIMALS,
    XMARS_DENOM,
} from '../../../../constants/appConstants'
import useStore from '../../../../store'

interface Props {
    amount: number
    stakedAmount: number
    setAmountCallback: (amount: number) => void
    actionButtonSpec: ModalActionButton
    submitted: boolean
    gasFeeFormatted: string
    activeView: ViewType
    denom: string
    decimals: number
    showWarning?: boolean
}

const ModalTab = ({
    amount,
    setAmountCallback,
    actionButtonSpec,
    submitted,
    gasFeeFormatted,
    activeView,
    denom,
    decimals,
    showWarning = false,
}: Props) => {
    const { t } = useTranslation()
    // ---------------
    // queries
    // ---------------
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const userWalletAddress = useStore((s) => s.userWalletAddress)
    const { findBalance } = useMarsBalance()
    const { xMarsRatio: unsafeXmarsRatio } = useStaking()

    // ---------------
    // States
    // ---------------
    // read only states
    const walletBallance = Number(findBalance(MARS_DENOM)?.amount || 0)
    const usableXMarsBalance = Number(findBalance(XMARS_DENOM)?.amount || 0)

    const xMarsBalance = Number(findBalance(XMARS_DENOM)?.amount || 0)

    // -------------
    // calculate
    // -------------
    // calculate xMarsRatio

    const xMarsRatio = unsafeXmarsRatio === 0 ? 1 : unsafeXmarsRatio
    const maxUsableAmount =
        activeView === ViewType.Stake ? walletBallance : usableXMarsBalance
    const newStakedAmount =
        activeView === ViewType.Stake
            ? xMarsBalance + amount / xMarsRatio
            : xMarsBalance - amount // we don't need to apply xMars scaling here as the amount is in xMars units

    // -----------
    // callbacks
    // -----------
    const onValueEntered = (newValue: number) => {
        let microValue = Number(magnify(newValue, decimals)) || 0
        if (microValue >= maxUsableAmount) microValue = maxUsableAmount
        setAmountCallback(microValue)
    }

    const maxButtonClickHandler = () => {
        setAmountCallback(maxUsableAmount)
    }

    const produceActionButton = () => {
        return (
            <Button
                disabled={actionButtonSpec.disabled}
                showProgressIndicator={submitted}
                text={actionButtonSpec.text}
                onClick={() => actionButtonSpec.clickHandler()}
                color='primary'
            />
        )
    }

    const onEnterAction = () => {
        if (!actionButtonSpec.disabled) actionButtonSpec.clickHandler()
    }

    const produceAvailableText = () => {
        const value = lookup(maxUsableAmount, denom, decimals)
        switch (activeView) {
            case ViewType.Unstake:
                return t('council.recieveAsset', {
                    assetAmount: formatValue(
                        Number(lookup(amount, denom, decimals)) * xMarsRatio,
                        2,
                        2,
                        true,
                        false,
                        false
                    ),
                    assetSymbol: 'MARS',
                })

            case ViewType.Deposit:
                return t('common.inWalletAmount', {
                    amount: formatValue(
                        value,
                        0,
                        4,
                        true,
                        false,
                        ` ${lookupSymbol(denom, whitelistedAssets || [])}`
                    ),
                })
        }

        // default
        return t('common.inWalletAmount', {
            amount: formatValue(
                value,
                0,
                4,
                true,
                false,
                ` ${lookupSymbol(denom, whitelistedAssets || [])}`
            ),
        })
    }

    // -------------
    // Presentation
    // -------------
    const actionButton = !userWalletAddress ? (
        <ConnectButton color={'secondary'} />
    ) : (
        produceActionButton()
    )
    return (
        <div>
            <InputSection
                inputCallback={onValueEntered}
                availableText={produceAvailableText()}
                amount={amount}
                maxUsableAmount={maxUsableAmount}
                setAmountCallback={setAmountCallback}
                actionButton={actionButton}
                gasFeeFormatted={gasFeeFormatted}
                taxFormatted={''}
                denom={activeView === ViewType.Unstake ? 'xMARS' : denom}
                decimals={decimals}
                maxButtonClickHandler={maxButtonClickHandler}
                showWarning={showWarning}
                activeView={activeView}
                onEnterHandler={onEnterAction}
            />

            <div className={styles.newSituation}>
                <div className={styles.valueContainer}>
                    <div className={styles.value}>
                        <span className={`overline ${styles.title}`}>
                            {t('council.currentVotingPower')}
                        </span>
                        <div>
                            <span className={`h4`}>
                                {`${formatValue(
                                    lookup(
                                        xMarsBalance,
                                        XMARS_DENOM,
                                        XMARS_DECIMALS
                                    ),
                                    2,
                                    2,
                                    true,
                                    false,
                                    false
                                )} `}
                            </span>
                            <span className={`body ${styles.symbol}`}>
                                xMARS
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles.valueContainer}>
                    <div className={styles.value}>
                        <span className={`overline ${styles.title}`}>
                            {t('council.newVotingPower')}
                        </span>
                        <div>
                            <span className={`h4`}>{`${formatValue(
                                lookup(
                                    newStakedAmount,
                                    XMARS_DENOM,
                                    XMARS_DECIMALS
                                ),
                                2,
                                2,
                                true,
                                false,
                                false
                            )} `}</span>
                            <span className={`body ${styles.symbol}`}>
                                xMARS
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalTab
