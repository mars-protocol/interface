import { SwapHoriz, Input, Replay } from '@material-ui/icons'
import GridActions, { GridActionType } from '../../components/grid/GridActions'
import CellAmount from '../../components/grid/CellAmount'
import Asset from '../../components/grid/Asset'
import { ViewType } from '../../types/enums'
import { formatValue } from '../../libs/parse'
import { ActionType } from '../../types/enums'
import Tippy from '@tippyjs/react'
import Apr from '../../components/tooltip/Apr'
import { ASTROPORT_URL } from '../../constants/appConstants'
import { Trans } from 'react-i18next'

export const supplyGridColumns = [
    {
        Header: 'Color',
        accessor: 'color',
        disableSortBy: true,
        width: '0',
        paddingOverride: 'unset',
        hideHeader: true,
        showOverflow: true,
        Cell: ({ cell: { value } }) => (
            <div
                style={{
                    backgroundColor: `${value}`,
                    width: '7px',
                    height: '55px',
                    marginLeft: '-7px',
                }}
            />
        ),
    },
    {
        Header: 'Logo',
        accessor: 'logo',
        disableSortBy: true,
        width: '7%',
        hideHeader: true,
        paddingOverride: '0 8px',
        Cell: ({ cell: { value } }) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={value} alt={'logo'} style={{ width: '24px' }} />
            </div>
        ),
    },
    {
        Header: <Trans i18nKey='common.asset' />,
        id: 'asset',
        accessor: 'symbol',
        paddingOverride: '0 8px 0 1px',
        headingPaddingOverride: '0 8px 0 1px',
        width: '16%',
        Cell: ({ cell: { value, row } }) => {
            return <Asset symbol={value || ''} name={row.original.name || ''} />
        },
    },
    {
        Header: <Trans i18nKey='common.inWallet' />,
        id: 'inWallet',
        accessor: (asset) => asset,
        width: '20%',
        Cell: (asset) => (
            <CellAmount
                denom={asset.value.denom}
                decimals={asset.value.decimals}
                amount={asset.value.wallet}
                uusdAmount={asset.value.uusdWallet}
            />
        ),
        sortType: (rowA, rowB) => {
            if (rowA.original.uusdWallet > rowB.original.uusdWallet) return 1
            if (rowB.original.uusdWallet > rowA.original.uusdWallet) return -1
            return 0
        },
    },
    {
        Header: <Trans i18nKey='mystation.deposited' />,
        id: 'deposited',
        accessor: (asset) => asset,
        width: '22%',
        Cell: (asset) => (
            <CellAmount
                denom={asset.value.denom}
                decimals={asset.value.decimals}
                amount={asset.value.balance}
                uusdAmount={asset.value.uusdBalance}
            />
        ),
        sortType: (rowA, rowB) => {
            if (rowA.original.uusdBalance > rowB.original.uusdBalance) return 1
            if (rowB.original.uusdBalance > rowA.original.uusdBalance) return -1
            return 0
        },
    },
    {
        Header: <Trans i18nKey='common.apy' />,
        accessor: 'apy',
        width: '13%',
        Cell: ({ cell: { value, row } }) => {
            const data = row.original
            const apy = (data?.apy || 0) + (data?.incentive?.apy || 0)
            return (
                <Tippy content={<Apr data={data} />}>
                    <div>
                        {formatValue(
                            apy || 0,
                            apy > 1000 ? 0 : 2,
                            apy > 1000 ? 0 : 2,
                            true,
                            false,
                            '%'
                        )}
                    </div>
                </Tippy>
            )
        },
    },
    {
        Header: 'Actions',
        accessor: (asset) => asset,
        disableSortBy: true,
        hideHeader: true,
        paddingOverride: '0px 8px 0px 0px',
        width: '25%',
        Cell: (asset) => {
            const swapUrl =
                asset.value.denom === 'uusd'
                    ? `${ASTROPORT_URL}?from=uluna&to=uusd`
                    : asset.value.denom === 'uluna'
                    ? `${ASTROPORT_URL}?from=uusd&to=uluna`
                    : `${ASTROPORT_URL}?from=uusd&to=${asset.value.contract_addr}`

            const supplyGridPrimaryAction = {
                icon: (
                    <Input
                        style={{
                            width: '1.0rem',
                            marginRight: '0.5rem',
                            opacity: 0.87,
                        }}
                    />
                ),
                title: <Trans i18nKey='redbank.deposit' />,
                actionType: ActionType.Modal,
                viewType: ViewType.Deposit,
                gridAction: GridActionType.DepositAction,
            }
            const supplyGridSecondaryAction = {
                icon: (
                    <Replay
                        style={{
                            width: '1.0rem',
                            marginRight: '0.5rem',
                            opacity: 0.87,
                        }}
                    />
                ),
                title: <Trans i18nKey='mystation.withdraw' />,
                gridAction: GridActionType.WithdrawAction,
                actionType: ViewType.Withdraw,
            }

            const supplyGridSwapAction = {
                icon: (
                    <SwapHoriz
                        style={{
                            width: '1.0rem',
                            marginRight: '0.5rem',
                            opacity: 0.87,
                        }}
                    />
                ),
                title: <Trans i18nKey='common.swap' />,
                actionType: ActionType.ExternalLink,
                gridAction: GridActionType.None,
                viewType: ViewType.None,
                url: swapUrl,
            }
            const supplyGridMenuItems =
                asset.value.balance > 0
                    ? [
                          supplyGridPrimaryAction,
                          supplyGridSecondaryAction,
                          supplyGridSwapAction,
                      ]
                    : [supplyGridPrimaryAction, supplyGridSwapAction]
            return (
                <GridActions
                    denom={asset.value.denom}
                    menuItems={supplyGridMenuItems}
                    actionType={GridActionType.DepositAction}
                />
            )
        },
    },
]

export const supplyGridInitialState = {
    sortBy: [
        {
            id: 'inWallet',
            desc: true,
        },
    ],
}

export const borrowGridColumns = [
    {
        Header: 'Color',
        accessor: 'color',
        disableSortBy: true,
        width: '0',
        hideHeader: true,
        paddingOverride: 'unset',
        showOverflow: true,
        Cell: ({ cell: { value } }) => (
            <div
                style={{
                    backgroundColor: `${value}`,
                    width: '7px',
                    height: '55px',
                    marginLeft: '-7px',
                }}
            />
        ),
    },
    {
        Header: 'Logo',
        accessor: 'logo',
        disableSortBy: true,
        width: '7%',
        hideHeader: true,
        paddingOverride: '0 8px',
        Cell: ({ cell: { value } }) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={value} alt={'logo'} style={{ width: '24px' }} />
            </div>
        ),
    },
    {
        Header: <Trans i18nKey='common.asset' />,
        id: 'asset',
        accessor: 'symbol',
        paddingOverride: '0 8px 0 1px',
        headingPaddingOverride: '0 8px 0 1px',
        width: '16%',
        Cell: ({ cell: { value, row } }) => {
            return <Asset symbol={value || ''} name={row.original.name || ''} />
        },
    },
    {
        Header: <Trans i18nKey='common.borrowed' />,
        id: 'borrowed',
        accessor: (asset) => asset,
        width: '20%',
        Cell: (asset) => (
            <CellAmount
                denom={asset.value.denom}
                decimals={asset.value.decimals}
                amount={asset.value.balance}
                uusdAmount={asset.value.uusdBalance}
            />
        ),
        sortType: (rowA, rowB) => {
            if (rowA.original.uusdBalance > rowB.original.uusdBalance) return 1
            if (rowB.original.uusdBalance > rowA.original.uusdBalance) return -1
            return 0
        },
    },
    {
        Header: () => <Trans i18nKey='mystation.borrowRate' />,
        accessor: 'apy',
        headingPaddingOverride: '8px',
        whiteSpace: 'normal',
        textAlign: 'left',
        width: '13%',
        Cell: ({ cell: { value } }) => {
            return <div>{formatValue(value || 0, 2, 2, true, false, '%')}</div>
        },
    },
    {
        Header: <Trans i18nKey='common.marketLiquidity' />,
        id: 'marketLiquidity',
        accessor: (asset) => asset,
        width: '22%',
        Cell: (asset) => (
            <CellAmount
                denom={asset.value.denom}
                decimals={asset.value.decimals}
                amount={asset.value.liquidity}
                uusdAmount={asset.value.uusdLiquidity}
            />
        ),
        sortType: (rowA, rowB) => {
            if (rowA.original.uusdLiquidity > rowB.original.uusdLiquidity)
                return 1
            if (rowB.original.uusdLiquidity > rowA.original.uusdLiquidity)
                return -1
            return 0
        },
    },
    {
        Header: 'Actions',
        accessor: (asset) => asset,
        disableSortBy: true,
        hideHeader: true,
        paddingOverride: '0px 8px 0px 0px',
        width: '22%',
        Cell: (asset) => {
            const swapUrl =
                asset.value.denom === 'uusd'
                    ? `${ASTROPORT_URL}?from=uluna&to=uusd`
                    : asset.value.denom === 'uluna'
                    ? `${ASTROPORT_URL}?from=uusd&to=uluna`
                    : `${ASTROPORT_URL}?from=uusd&to=${asset.value.contract_addr}`

            const borrowGridPrimaryAction = {
                icon: (
                    <Input
                        style={{
                            width: '1.0rem',
                            marginRight: '0.5rem',
                            opacity: 0.87,
                        }}
                    />
                ),
                title: <Trans i18nKey='common.borrow' />,
                actionType: ActionType.Modal,
                viewType: ViewType.Borrow,
            }
            const borrowGridSecondaryAction = {
                icon: (
                    <Replay
                        style={{
                            width: '1.0rem',
                            marginRight: '0.5rem',
                            opacity: 0.87,
                        }}
                    />
                ),
                title: <Trans i18nKey='common.repay' />,
                actionType: ActionType.Modal,
                gridAction: GridActionType.RepayAction,
                viewType: ViewType.Repay,
            }
            const borrowGridSwapAction = {
                icon: (
                    <SwapHoriz
                        style={{
                            width: '1.0rem',
                            marginRight: '0.5rem',
                            opacity: 0.87,
                        }}
                    />
                ),
                title: <Trans i18nKey='common.swap' />,
                actionType: ActionType.ExternalLink,
                gridAction: GridActionType.None,
                viewType: ViewType.None,
                url: swapUrl,
            }

            const borrowGridMenuItems =
                asset.value.balance > 0 && asset.value.uusdWallet > 100 // account for dust
                    ? [
                          borrowGridPrimaryAction,
                          borrowGridSecondaryAction,
                          borrowGridSwapAction,
                      ]
                    : [borrowGridPrimaryAction, borrowGridSwapAction]

            return (
                <GridActions
                    denom={asset.value.denom}
                    menuItems={borrowGridMenuItems}
                    actionType={GridActionType.BorrowAction}
                />
            )
        },
    },
]

export const borrowGridInitialState = {
    sortBy: [
        {
            id: 'borrowed',
            desc: true,
        },
    ],
}

export const notConnectedSupplyGridColumns = [
    {
        Header: 'Color',
        accessor: 'color',
        disableSortBy: true,
        width: '0',
        paddingOverride: 'unset',
        hideHeader: true,
        showOverflow: true,
        Cell: ({ cell: { value } }) => (
            <div
                style={{
                    backgroundColor: `${value}`,
                    width: '7px',
                    height: '55px',
                    marginLeft: '-7px',
                }}
            />
        ),
    },
    {
        Header: 'Logo',
        accessor: 'logo',
        disableSortBy: true,
        width: '7%',
        hideHeader: true,
        paddingOverride: '0 8px',
        Cell: ({ cell: { value } }) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={value} alt={'logo'} style={{ width: '24px' }} />
            </div>
        ),
    },
    {
        Header: <Trans i18nKey='common.asset' />,
        id: 'asset',
        accessor: (asset) => asset,
        disableSortBy: true,
        paddingOverride: '0 8px 0 1px',
        headingPaddingOverride: '0 8px 0 1px',
        width: '58%',
        Cell: (asset) => (
            <Asset
                symbol={asset.value.symbol || ''}
                name={asset.value.name || ''}
            />
        ),
    },
    {
        Header: <Trans i18nKey='common.apy' />,
        accessor: 'apy',
        width: '13%',
        Cell: ({ cell: { value, row } }) => {
            const data = row.original
            const apy = (data?.apy || 0) + (data?.incentive?.apy || 0)
            return (
                <Tippy content={<Apr data={data} />}>
                    <div>{formatValue(apy || 0, 2, 2, true, false, '%')}</div>
                </Tippy>
            )
        },
    },
    {
        Header: 'Actions',
        accessor: (asset) => asset,
        disableSortBy: true,
        hideHeader: true,
        paddingOverride: '0px 8px 0px 0px',
        width: '22%',
        Cell: (asset) => {
            const supplyGridPrimaryAction = {
                icon: (
                    <Input
                        style={{
                            width: '1.0rem',
                            marginRight: '0.5rem',
                            opacity: 0.87,
                        }}
                    />
                ),
                title: <Trans i18nKey='redbank.deposit' />,
                actionType: ActionType.Modal,
                viewType: ViewType.Deposit,
            }
            const supplyGridMenuItems = [supplyGridPrimaryAction]

            return (
                <GridActions
                    denom={asset.value.denom}
                    menuItems={supplyGridMenuItems}
                    actionType={GridActionType.DepositAction}
                    disabled={true}
                />
            )
        },
    },
]

export const notConnectedSupplyGridInitialState = {
    sortBy: [
        {
            id: 'apy',
            desc: true,
        },
    ],
}

export const notConnectedBorrowGridColumns = [
    {
        Header: 'Color',
        accessor: 'color',
        disableSortBy: true,
        width: '0',
        hideHeader: true,
        paddingOverride: 'unset',
        showOverflow: true,
        Cell: ({ cell: { value } }) => (
            <div
                style={{
                    backgroundColor: `${value}`,
                    width: '7px',
                    height: '55px',
                    marginLeft: '-7px',
                }}
            ></div>
        ),
    },
    {
        Header: 'Logo',
        accessor: 'logo',
        disableSortBy: true,
        width: '7%',
        hideHeader: true,
        paddingOverride: '0 8px',
        Cell: ({ cell: { value } }) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={value} alt={'logo'} style={{ width: '24px' }} />
            </div>
        ),
    },
    {
        Header: <Trans i18nKey='common.asset' />,
        id: 'asset',
        accessor: (asset) => asset,
        disableSortBy: true,
        paddingOverride: '0 8px 0 1px',
        headingPaddingOverride: '0 8px 0 1px',
        width: '33%',
        Cell: (asset) => (
            <Asset
                symbol={asset.value.symbol || ''}
                name={asset.value.name || ''}
            />
        ),
    },
    {
        Header: () => <Trans i18nKey='mystation.borrowRate' />,
        accessor: 'apy',
        width: '16%',
        Cell: ({ cell: { value } }) => {
            return <div>{formatValue(value || 0, 2, 2, true, false, '%')}</div>
        },
    },
    {
        Header: <Trans i18nKey='common.marketLiquidity' />,
        id: 'marketLiquidity',
        accessor: (asset) => asset,
        width: '22%',
        Cell: (asset) => (
            <CellAmount
                denom={asset.value.denom}
                decimals={asset.value.decimals}
                amount={asset.value.liquidity}
                uusdAmount={asset.value.uusdLiquidity}
            />
        ),
        sortType: (rowA, rowB) => {
            if (rowA.original.uusdLiquidity > rowB.original.uusdLiquidity)
                return 1
            if (rowB.original.uusdLiquidity > rowA.original.uusdLiquidity)
                return -1
            return 0
        },
    },
    {
        Header: 'Actions',
        accessor: (asset) => asset,
        disableSortBy: true,
        hideHeader: true,
        paddingOverride: '0px 8px 0px 0px',
        width: '22%',
        Cell: (asset) => {
            const borrowGridPrimaryAction = {
                icon: (
                    <Input
                        style={{
                            width: '1.0rem',
                            marginRight: '0.5rem',
                            opacity: 0.87,
                        }}
                    />
                ),
                title: <Trans i18nKey='common.borrow' />,
                actionType: ActionType.Modal,
                viewType: ViewType.Borrow,
            }
            const borrowGridMenuItems = [borrowGridPrimaryAction]

            return (
                <GridActions
                    denom={asset.value.denom}
                    menuItems={borrowGridMenuItems}
                    actionType={GridActionType.BorrowAction}
                    disabled={true}
                />
            )
        },
    },
]

export const notConnectedBorrowGridInitialState = {
    sortBy: [
        {
            id: 'apy',
            desc: true,
        },
    ],
}
