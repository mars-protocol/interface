import { Input, SwapHoriz } from '@material-ui/icons'
import Asset from '../../components/grid/Asset'
import GridActions, { GridActionType } from '../../components/grid/GridActions'
import { ActionType } from '../../types/enums'
import CellAmount from '../../components/grid/CellAmount'
import { formatValue, lookup, formatCooldown } from '../../libs/parse'
import { ViewType } from '../../types/enums'
import Tippy from '@tippyjs/react'
import Apr from '../../components/tooltip/Apr'
import { ASTROPORT_URL } from '../../constants/appConstants'
import { useHistory } from 'react-router'
import moment from 'moment'
import 'moment-duration-format'
import colors from '../../styles/_assets.module.scss'
import { Trans } from 'react-i18next'
import Button from '../../components/Button'

const withdrawMenuItem = {
    icon: (
        <Input
            style={{ width: '1.0rem', marginRight: '0.5rem', opacity: 0.6 }}
        />
    ),
    title: <Trans i18nKey='mystation.withdraw' />,
    actionType: ActionType.Modal,
    viewType: ViewType.Withdraw,
    gridAction: GridActionType.WithdrawAction,
}

const depositMenuItem = {
    icon: (
        <Input
            style={{ width: '1.0rem', marginRight: '0.5rem', opacity: 0.6 }}
        />
    ),
    title: <Trans i18nKey='redbank.deposit' />,
    actionType: ActionType.Modal,
    viewType: ViewType.Deposit,
    gridAction: GridActionType.DepositAction,
}

const repayMenuItem = {
    icon: (
        <Input
            style={{ width: '1.0rem', marginRight: '0.5rem', opacity: 0.6 }}
        />
    ),
    title: <Trans i18nKey='common.repay' />,
    actionType: ActionType.Modal,
    viewType: ViewType.Repay,
}

const borrowMenuItem = {
    icon: (
        <Input
            style={{ width: '1.0rem', marginRight: '0.5rem', opacity: 0.6 }}
        />
    ),
    title: <Trans i18nKey='common.borrow' />,
    actionType: ActionType.Modal,
    viewType: ViewType.Borrow,
    gridAction: GridActionType.BorrowAction,
}

const getSwapMenuItem = (swapUrl) => {
    return {
        icon: (
            <SwapHoriz
                style={{ width: '1.0rem', marginRight: '0.5rem', opacity: 0.6 }}
            />
        ),
        title: <Trans i18nKey='common.swap' />,
        actionType: ActionType.ExternalLink,
        gridAction: GridActionType.None,
        viewType: ViewType.None,
        url: swapUrl,
    }
}

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
        Header: 'Balance',
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
        Header: () => 'Income/Day',
        centeredHeader: true,
        accessor: 'incomeOrExpense',
        width: '22%',
        Cell: ({ cell: { value } }) => (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'left',
                }}
            >
                {formatValue(value, 2, 2, true, '$')}
            </div>
        ),
    },
    {
        Header: 'Actions',
        accessor: 'denom',
        disableSortBy: true,
        hideHeader: true,
        paddingOverride: '0px 8px 0px 0px',
        width: '25%',
        Cell: ({
            cell: {
                row: { values },
            },
        }) => {
            const swapUrl =
                values.denom === 'uusd'
                    ? `${ASTROPORT_URL}?from=uluna&to=uusd`
                    : values.denom === 'uluna'
                    ? `${ASTROPORT_URL}?from=uusd&to=uluna`
                    : `${ASTROPORT_URL}?from=uusd&to=${values?.contract_addr}`

            const supplyGridMenuItems = []
            supplyGridMenuItems.push(withdrawMenuItem)
            if (values.Balance.uusdWallet > 100)
                supplyGridMenuItems.push(depositMenuItem)
            supplyGridMenuItems.push(getSwapMenuItem(swapUrl))

            return (
                <GridActions
                    denom={values.denom}
                    menuItems={supplyGridMenuItems}
                    actionType={GridActionType.WithdrawAction}
                />
            )
        },
    },
]

export const supplyGridInitialState = {
    sortBy: [
        {
            id: 'Balance',
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
        Header: 'Balance',
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
        Header: <Trans i18nKey='mystation.borrowRate' />,
        accessor: 'apy',
        width: '18%',
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
        Header: () => 'Expense/Day',
        centeredHeader: true,
        accessor: 'incomeOrExpense',
        width: '22%',
        Cell: ({ cell: { value } }) => (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'left',
                }}
            >
                {formatValue(value, 2, 2, true, '$')}
            </div>
        ),
    },

    {
        Header: 'Actions',
        accessor: 'denom',
        disableSortBy: true,
        hideHeader: true,
        paddingOverride: '0px 8px 0px 0px',
        width: '22%',
        Cell: ({
            cell: {
                row: { values },
            },
        }) => {
            const swapUrl =
                values.denom === 'uusd'
                    ? `${ASTROPORT_URL}?from=uluna&to=uusd`
                    : values.denom === 'uluna'
                    ? `${ASTROPORT_URL}?from=uusd&to=uluna`
                    : `${ASTROPORT_URL}?from=uusd&to=${values?.contract_addr}`
            const borrowGridMenuItems = []
            if (values.Balance.uusdWallet)
                borrowGridMenuItems.push(repayMenuItem)
            borrowGridMenuItems.push(borrowMenuItem)
            borrowGridMenuItems.push(getSwapMenuItem(swapUrl))

            return (
                <GridActions
                    denom={values.denom}
                    menuItems={borrowGridMenuItems}
                    actionType={GridActionType.RepayAction}
                />
            )
        },
    },
]

export const borrowGridInitialState = {
    sortBy: [
        {
            id: 'name',
            desc: true,
        },
    ],
}

export const myLockdropGridColumns = [
    {
        Header: 'Logos',
        accessor: 'logos',
        disableSortBy: true,
        width: '20px',
        hideHeader: true,
        paddingOverride: '0 0 0 8px',

        Cell: ({ cell: { value } }) => {
            return (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    {value.map((logo, index) => {
                        return (
                            <img
                                src={logo}
                                key={index}
                                alt={'logo'}
                                style={
                                    index !== 0
                                        ? {
                                              width: '24px',
                                              marginLeft: '-10px',
                                              zIndex: '1',
                                              position: 'relative',
                                          }
                                        : {
                                              width: '24px',
                                              zIndex: '2',
                                              position: 'relative',
                                          }
                                }
                            />
                        )
                    })}
                </div>
            )
        },
    },
    {
        Header: <Trans i18nKey='fields.position' />,
        accessor: 'position',
        width: '15%',
        Cell: ({ cell: { value, row } }) => {
            const positionName = row.original.name
            return (
                <p>
                    {value}
                    {positionName.length > 0 && (
                        <>
                            <br />
                            <span style={{ opacity: 0.6, fontSize: '11px' }}>
                                {positionName}
                            </span>
                        </>
                    )}
                </p>
            )
        },
    },
    {
        Header: <Trans i18nKey='mystation.myLiquidity' />,
        accessor: 'liquidity',
        width: '12%',
        Cell: ({ cell: { value, row } }) => {
            const denom = row.original.denom
            const decimals = row.original.decimals
            return formatValue(lookup(value, denom, decimals), 2, 2, true, '$')
        },
    },
    {
        Header: <Trans i18nKey='mystation.marsReceived' />,
        accessor: 'rewards',
        width: '14%',
        Cell: ({ cell: { value, row } }) => {
            const denom = row.original.denom
            const decimals = row.original.decimals
            return formatValue(lookup(value, denom, decimals))
        },
    },
    // {
    //     Header: <Trans i18nKey='common.apy' />,
    //     accessor: 'apy',
    //     width: '8%',
    //     Cell: ({ cell: { value } }) => {
    //         return formatValue(value, 2, 2, true, false, '%', true)
    //     },
    // },
    {
        Header: <Trans i18nKey='mystation.unlockedLiquidity' />,
        accessor: 'unlocked',
        width: '13%',
        Cell: ({ cell: { value, row } }) => {
            const denom = row.original.denom
            const decimals = row.original.decimals
            const total = row.original.liquidity
            const unlockedValued = lookup(value, denom, decimals)
            return unlockedValued < 0.01 ? (
                '–'
            ) : (
                <p>
                    {formatValue(unlockedValued, 2, 2, true, '$')}

                    <br />
                    <span style={{ opacity: 0.6, fontSize: '11px' }}>
                        {formatValue(
                            (total === 0 ? 0 : value / total) * 100,
                            2,
                            2,
                            true,
                            false,
                            '%',
                            true
                        )}
                    </span>
                </p>
            )
        },
    },
    {
        Header: <Trans i18nKey='mystation.fullyUnlocksOn' />,
        accessor: 'timestamp',
        width: '18%',
        Cell: ({ cell: { value, row } }) => {
            const unlockDate = moment.unix(value)
            const currentTimeUnix = moment().unix()
            const unlockSecondsLeft =
                value - currentTimeUnix >= 0 ? value - currentTimeUnix : 0
            const isLP = row.original.position === 'MARS-UST'
            return (
                <div>
                    {unlockSecondsLeft <= 0 ? (
                        <span style={{ color: colors.primary }}>
                            <Trans i18nKey='mystation.lockHasEnded' />
                        </span>
                    ) : (
                        unlockDate.format('DD/MMM/YY')
                    )}
                    <div
                        style={{
                            opacity: 0.6,
                            margin: '3px 0 0',
                        }}
                        className={'caption'}
                    >
                        <span>
                            {
                                <Trans
                                    i18nKey='mystation.timeLeft'
                                    values={{
                                        time: formatCooldown(unlockSecondsLeft),
                                    }}
                                />
                            }
                            {isLP && (
                                <>
                                    <br />
                                    <Trans i18nKey='mystation.unlocksLinearOverTime' />
                                </>
                            )}
                        </span>
                    </div>
                </div>
            )
        },
    },
    {
        Header: 'Actions',
        disableSortBy: true,
        hideHeader: true,
        paddingOverride: '0px 24px 0px 0px',
        width: '113px',
        Cell: ({ cell: { row } }) => {
            const denom = row.original.denom
            const decimals = row.original.decimals
            const history = useHistory()
            const disabled =
                lookup(row.original.unlocked, denom, decimals) < 0.01
            const positionName = row.original.name
            const positionDuration = row.original.duration
            return (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        text={<Trans i18nKey='mystation.withdraw' />}
                        onClick={() => {
                            positionName.length > 0
                                ? history.push(
                                      `/mystation/lockdrop/phase1/${positionDuration}`
                                  )
                                : history.push(`/mystation/lockdrop/phase2`)
                        }}
                        disabled={disabled}
                    />
                </div>
            )
        },
    },
]

export const myLockdropGridInitialState = {
    sortBy: [
        {
            id: 'position',
            desc: false,
        },
    ],
}
