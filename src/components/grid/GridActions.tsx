import OverflowDropdown from '../../components/grid/dropdown/OverflowDropdown'
import useActionButtonClickHandler from '../../hooks/useActionButtonClickHandler'
import { useRedBank, useAccountBalance } from '../../hooks'
import { useTranslation } from 'react-i18next'
import { DropdownItemProps } from '../../types/components'
import { useHistory, useLocation } from 'react-router'
import { ASTROPORT_URL } from '../../constants/appConstants'
import useStore from '../../store'
import Button from '../Button'
import { ExternalSVG } from '../Svg'
import { getRoute } from '../../libs/parse'
import { ActionType } from '../../types/enums'

export enum GridActionType {
    BorrowAction,
    DepositAction,
    WithdrawAction,
    ManageAction,
    RepayAction,
    None,
}

interface Props {
    denom: string
    menuItems: DropdownItemProps[]
    actionType: GridActionType
    strategy?: StrategyObject
    disabled?: boolean
}

const GridActions = ({
    denom,
    menuItems,
    actionType,
    strategy,
    disabled = false,
}: Props) => {
    const { t } = useTranslation()
    const newMenuItems = [...menuItems]
    const mainButton = newMenuItems[0]
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)

    const { find, findDeposit } = useAccountBalance()
    const { findLiquidity, findMarketInfo } = useRedBank()
    const provideClickHandler = useActionButtonClickHandler()
    const history = useHistory()
    const location = useLocation()

    const swapUrl =
        denom === 'uusd'
            ? `${ASTROPORT_URL}?from=uluna&to=uusd`
            : denom === 'uluna'
            ? `${ASTROPORT_URL}?from=uusd&to=uluna`
            : `${ASTROPORT_URL}?from=uusd&to=${
                  whitelistedAssets?.find((asset) => asset.denom === denom)
                      ?.contract_addr
              }`

    const marketInfo = findMarketInfo(denom)

    const buyClickHandler = provideClickHandler(
        ActionType.ExternalLink,
        denom,
        GridActionType.None,
        swapUrl
    )

    let dropdownMenuItems = newMenuItems.slice(1, menuItems.length)

    let useBuyButton = false
    if (actionType === GridActionType.DepositAction) {
        const assetWallet = find(denom)

        if (Number(assetWallet?.amount || 0) <= 0) useBuyButton = true
    }

    let disabledDepositButton: boolean = false
    // If the market has had deposits disabled then disable deposit button
    if (
        actionType === GridActionType.DepositAction &&
        !marketInfo?.deposit_enabled
    ) {
        disabledDepositButton = true
    }
    // Remove deposit from submenu if it's disabled (applicable to My Station's grid)
    if (
        actionType === GridActionType.WithdrawAction &&
        !marketInfo?.deposit_enabled
    ) {
        dropdownMenuItems = dropdownMenuItems.filter(
            (item) => item.gridAction !== GridActionType.DepositAction
        )
    }

    let disableBorrowButton: boolean = false
    if (actionType === GridActionType.BorrowAction) {
        // If the market has had borrows disabled then disable borrow button
        if (!marketInfo?.borrow_enabled) {
            disableBorrowButton = true
        }
        // If the user has no collateral then disable borrow button
        if (!disableBorrowButton && whitelistedAssets?.length) {
            let depositSum: number = 0
            whitelistedAssets.forEach((asset) => {
                depositSum += Number(findDeposit(asset.denom)?.amount || 0)
            })

            if (depositSum <= 0) disableBorrowButton = true
        }
        // if the market has no liquidity available then disable borrow button
        if (!disableBorrowButton) {
            const assetLiquidity = findLiquidity(denom)

            if (Number(assetLiquidity?.amount || 0) <= 0)
                disableBorrowButton = true
        }
    }
    // Remove borrow from submenu if it's disabled (applicable to My Station's grid)
    if (
        actionType === GridActionType.RepayAction &&
        !marketInfo?.borrow_enabled
    ) {
        dropdownMenuItems = dropdownMenuItems.filter(
            (item) => item.gridAction !== GridActionType.BorrowAction
        )
    }

    // Disabled prop is used to disable all actions of a market on the UI, i.e. on the not connected screens where we show a dummie grid
    // The !marketInfo?.active flag determines if all actions against the market has been disabled on the SC level
    const isAllActionsDisabled: boolean = disabled || !marketInfo?.active
    const isDropdownDisabled: boolean =
        useBuyButton &&
        dropdownMenuItems.length === 1 &&
        dropdownMenuItems[0].title === 'Swap'
    const isPrimaryActionDisabled: boolean =
        disabledDepositButton || disableBorrowButton

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
            }}
        >
            {useBuyButton ? (
                <Button
                    text={t('common.buy')}
                    suffix={<ExternalSVG />}
                    color='secondary'
                    onClick={buyClickHandler}
                    disabled={disabled}
                />
            ) : (
                <>
                    {strategy ? (
                        <Button
                            text={mainButton?.title || ''}
                            onClick={() => {
                                history.push(`/fields/${actionType}`)
                            }}
                            disabled={disabled}
                        />
                    ) : (
                        <Button
                            text={mainButton?.title || ''}
                            disabled={
                                isAllActionsDisabled || isPrimaryActionDisabled
                            }
                            onClick={() => {
                                history.push(
                                    `${location.pathname}/${getRoute(
                                        actionType
                                    )}/${denom}`
                                )
                            }}
                        />
                    )}
                </>
            )}
            <OverflowDropdown
                menuItems={dropdownMenuItems}
                denom={denom}
                strategy={strategy}
                disabled={isAllActionsDisabled || isDropdownDisabled}
            />
        </div>
    )
}

export default GridActions
