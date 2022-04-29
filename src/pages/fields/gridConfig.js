import BorrowLimit from '../../components/borrowlimit/BorrowLimit'
import useActionButtonClickHandler from '../../hooks/useActionButtonClickHandler'
import { useAccountBalance } from '../../hooks'
import { formatValue, lookup } from '../../libs/parse'
import { GridActionType } from '../../components/grid/GridActions'
import { useHistory } from 'react-router'
import { ASTROPORT_URL } from '../../constants/appConstants'
import Apy from '../../components/tooltip/Apy'
import PnL from '../../components/tooltip/PnL'
import Tippy from '@tippyjs/react'
import { Trans } from 'react-i18next'
import Button from '../../components/Button'
import { ExternalSVG } from '../../components/Svg'
import { ActionType } from '../../types/enums'

export const activeStrategyGridColumns = [
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
                    width: '7px',
                    height: '55px',
                    marginLeft: '-7px',
                    backgroundColor: value,
                }}
            />
        ),
    },
    {
        Header: 'Logo',
        accessor: 'logo',
        disableSortBy: true,
        width: '30px',
        hideHeader: true,
        paddingOverride: '0 0 0 8px',
        Cell: ({ cell: { value, row } }) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={row.original.assets[0].logo}
                        alt={row.original.assets[0].denom}
                        style={{
                            width: '24px',
                            margin: '0 -7px 11px 0',
                            zIndex: '2',
                            position: 'relative',
                            borderRadius: '12px',
                            boxShadow: '1px 1px 3px rgba(0,0,0,.5)',
                        }}
                    />
                    <img
                        src={value}
                        alt={row.original.assets[1].denom}
                        style={{
                            width: '24px',
                            zIndex: '1',
                            marginTop: '14px',
                            position: 'relative',
                        }}
                    />
                </div>
            </div>
        ),
    },
    {
        Header: <Trans i18nKey='fields.position' />,
        accessor: 'key',
        width: '10%',
        sortDescFirst: true,
        Cell: ({ cell: { value, row } }) => {
            return (
                <>
                    <p>
                        <Trans i18nKey={`strategy.${value}`} />
                    </p>
                    <p
                        style={{
                            opacity: 0.5,
                        }}
                    >
                        <Trans
                            i18nKey={
                                row.original.provider.name === 'Mars'
                                    ? 'common.by'
                                    : 'common.via'
                            }
                        />{' '}
                        {row.original.provider.name}
                    </p>
                </>
            )
        },
    },
    {
        Header: <Trans i18nKey='fields.netValue' />,
        accessor: 'position.net_worth',
        textAlign: 'right',
        width: '10%',
        Cell: ({ cell: { value, row } }) => {
            const denom = row.original.position.denom
            const decimals = row.original.position.decimals
            return formatValue(lookup(value, denom, decimals), 2, 2, true, '$')
        },
    },
    {
        Header: <Trans i18nKey='fields.positionValue' />,
        accessor: 'health.bond_value',
        textAlign: 'right',
        width: '10%',
        Cell: ({ cell: { value, row } }) => {
            const denom = row.original.position.denom
            const decimals = row.original.position.decimals
            return formatValue(lookup(value, denom, decimals), 2, 2, true, '$')
        },
    },
    {
        Header: <Trans i18nKey='common.borrowed' />,
        accessor: 'health.debt_value',
        textAlign: 'right',
        width: '10%',
        Cell: ({ cell: { value, row } }) => {
            const denom = row.original.position.denom
            const decimals = row.original.position.decimals
            return formatValue(lookup(value, denom, decimals), 2, 2, true, '$')
        },
    },
    {
        Header: <Trans i18nKey='fields.pnl' />,
        accessor: 'position.pnl',
        textAlign: 'right',
        width: '10%',
        Cell: ({ cell: { value, row } }) => {
            const denom = row.original.position.denom
            const since = new Date(
                Number(row.original.snapshot.time) * 1000
            ).toLocaleDateString('en-US')
            const decimals = row.original.position.decimals
            const pnlValue = lookup(value, denom, decimals)
            const initial = lookup(
                row.original.snapshot.health.bond_value -
                    row.original.snapshot.health.debt_value,
                denom,
                decimals
            )
            const current = lookup(
                row.original.position.net_worth,
                denom,
                decimals
            )

            return (
                <Tippy
                    content={
                        <PnL
                            initial={initial}
                            current={current}
                            pnlValue={pnlValue}
                        />
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                            className={
                                pnlValue > 0
                                    ? 'color-green'
                                    : pnlValue < 0
                                    ? 'colorInfoLoss'
                                    : ''
                            }
                        >
                            {formatValue(
                                Math.abs(pnlValue),
                                2,
                                2,
                                true,
                                pnlValue >= 0 ? '$' : '$-'
                            )}
                        </span>
                        <span
                            style={{
                                opacity: 0.6,
                                fontSize: '11px',
                                lineHeight: '13px',
                            }}
                        >{`Since ${since}`}</span>
                    </div>
                </Tippy>
            )
        },
    },
    {
        id: 'apy',
        Header: <Trans i18nKey='common.apy' />,
        accessor: 'position.trueApy',
        textAlign: 'right',
        width: '8%',
        Cell: ({ cell: { value, row } }) => {
            const apyData = row.original.apy
            const aprData = row.original.apr
            const leverage = row.original.position.leverage
            const token = row.original.assets[0].symbol
            return value > 0 ? (
                <Tippy
                    content={
                        <Apy
                            trueApy={value}
                            apyData={apyData}
                            aprData={aprData}
                            token={token}
                            leverage={leverage}
                        />
                    }
                >
                    <div>
                        {formatValue(value, 2, 2, true, false, '%', true)}
                    </div>
                </Tippy>
            ) : (
                <div>-</div>
            )
        },
    },
    {
        Header: <Trans i18nKey='fields.leverage' />,
        accessor: 'position.leverage',
        textAlign: 'right',
        width: '8%',
        Cell: ({ cell: { value } }) => {
            return formatValue(value, 2, 2, true, false, 'x', true)
        },
    },
    {
        Header: <Trans i18nKey='fields.liqPrice' />,
        accessor: 'position.liquidation_price',
        textAlign: 'right',
        width: '10%',
        Cell: ({ cell: { value, row } }) => {
            return (
                <>
                    <p style={{ margin: 0 }}>
                        {formatValue(value, 2, 2, true, '$', false)}
                    </p>
                    <p className='caption' style={{ opacity: 0.5, margin: 0 }}>
                        {row.original.assets[0].symbol}
                    </p>
                </>
            )
        },
    },
    {
        Header: <Trans i18nKey='common.ltv' />,
        accessor: 'health.ltv',
        width: '192px',
        Cell: ({ cell: { value, row } }) => {
            const liqThreshold = row.original.max_ltv
            const percentageValue = Number(value) * 100
            const maxDecimals =
                percentageValue < 1 ? 2 : percentageValue < 10 ? 1 : 0

            return (
                <BorrowLimit
                    width={'160px'}
                    ltv={formatValue(
                        percentageValue.toPrecision(2),
                        0,
                        maxDecimals
                    )}
                    mode={'percentage'}
                    maxLtv={liqThreshold * 100}
                    criticalIndicator={50 / liqThreshold}
                    liquidationThreshold={liqThreshold * 100}
                    barHeight={'20px'}
                    showPercentageText={true}
                    showTitleText={false}
                    showLegend={false}
                    top={2}
                    percentageThreshold={22}
                    percentageOffset={50}
                />
            )
        },
    },
    {
        Header: 'Actions',
        disableSortBy: true,
        hideHeader: true,
        paddingOverride: '0px 8px 0px 0px',
        width: '113px',
        Cell: ({ cell: { row } }) => {
            const history = useHistory()
            return (
                <Button
                    text={<Trans i18nKey='fields.manage' />}
                    onClick={() => {
                        history.push(`/fields/${row.original.key}`)
                    }}
                />
            )
        },
    },
]

export const activeStrategyGridInitialState = {
    sortBy: [
        {
            id: 'ltv',
            desc: true,
        },
    ],
}

export const strategyGridColumns = [
    {
        Header: 'Logo',
        accessor: 'logo',
        disableSortBy: true,
        width: '30px',
        hideHeader: true,
        paddingOverride: '0 0 0 8px',
        Cell: ({ cell: { value, row } }) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src={row.original.assets[0].logo}
                    alt={row.original.assets[0].denom}
                    style={{
                        width: '24px',
                        margin: '0 -7px 11px 0',
                        zIndex: '2',
                        position: 'relative',
                        borderRadius: '12px',
                        boxShadow: '1px 1px 3px rgba(0,0,0,.5)',
                    }}
                />
                <img
                    src={value}
                    alt={row.original.assets[1].denom}
                    style={{
                        width: '24px',
                        zIndex: '1',
                        marginTop: '14px',
                        position: 'relative',
                    }}
                />
            </div>
        ),
    },
    {
        Header: <Trans i18nKey='fields.position' />,
        accessor: 'key',
        width: '10%',
        sortDescFirst: true,
        Cell: ({ cell: { value, row } }) => {
            return (
                <>
                    <p>
                        <Trans i18nKey={`strategy.${value}`} />
                    </p>
                    <p
                        style={{
                            opacity: 0.5,
                        }}
                    >
                        <Trans
                            i18nKey={
                                row.original.provider.name === 'Mars'
                                    ? 'common.by'
                                    : 'common.via'
                            }
                        />{' '}
                        {row.original.provider.name}
                    </p>
                </>
            )
        },
    },
    {
        Header: <Trans i18nKey='fields.leverage' />,
        accessor: 'maxLeverage',
        width: '10%',
        textAlign: 'right',
        sortDescFirst: true,
        Cell: ({ cell: { value } }) => {
            return <p>{value}x</p>
        },
    },
    {
        id: 'apy',
        Header: <Trans i18nKey='common.apy' />,
        accessor: 'position.apy',
        width: '10%',
        textAlign: 'right',
        sortDescFirst: true,
        Cell: ({ cell: { value, row } }) => {
            const apyData = row.original.apy
            const aprData = row.original.apr
            const token = row.original.assets[0].symbol
            return value > 0 ? (
                <Tippy
                    content={
                        <Apy
                            trueApy={value}
                            apyData={apyData}
                            aprData={aprData}
                            token={token}
                        />
                    }
                >
                    <div>
                        {formatValue(value, 2, 2, true, false, '%', true)}
                    </div>
                </Tippy>
            ) : (
                <div>-</div>
            )
        },
    },
    {
        Header: <Trans i18nKey='fields.creditLine' />,
        accessor: 'uncollaterisedLoanLimit',
        width: '10%',
        textAlign: 'right',
        sortDescFirst: true,
        Cell: ({ cell: { value, row } }) => {
            const uncollaterisedLoanLimit = row.original.uncollaterisedLoanLimit
            let percentageUsed =
                (row.original.strategyTotalDebt / uncollaterisedLoanLimit) * 100

            percentageUsed =
                percentageUsed < 0.01
                    ? 0
                    : Math.min(Math.ceil(percentageUsed), 100)

            return (
                <>
                    <p>
                        <span className='caption' style={{ opacity: 0.5 }}>
                            ${' '}
                        </span>
                        {formatValue(
                            lookup(uncollaterisedLoanLimit, '$', 6),
                            2,
                            2,
                            true,
                            '',
                            true,
                            true
                        )}
                    </p>
                    <p
                        className={`caption ${
                            percentageUsed === 100 ? 'red' : ''
                        }`}
                        style={{
                            opacity: percentageUsed === 100 ? 1 : 0.5,
                        }}
                    >
                        {percentageUsed}% <Trans i18nKey='common.used' />
                    </p>
                </>
            )
        },
    },
    {
        Header: <Trans i18nKey='common.iSupply' />,
        accessor: 'assets',
        width: '10%',
        sortDescFirst: true,
        Cell: ({ cell: { value } }) =>
            value[0].symbol + ' - ' + value[1].symbol,
    },
    {
        Header: (
            <span style={{ textTransform: 'capitalize' }}>
                <Trans i18nKey='common.via' />
            </span>
        ),
        accessor: 'provider',
        width: '8%',
        textAlign: 'right',
        Cell: ({ cell: { value } }) => {
            return (
                <img
                    style={{ height: '32px' }}
                    src={value.logo}
                    alt={value.name}
                />
            )
        },
    },
    {
        id: 'description',
        Header: <Trans i18nKey='common.description' />,
        accessor: 'key',
        width: '40%',
        disableSortBy: true,
        Cell: ({ cell: { value } }) => (
            <p>
                <Trans i18nKey={`strategy.${value}Description`} />
            </p>
        ),
    },
    {
        Header: 'Actions',
        disableSortBy: true,
        hideHeader: true,
        width: '113px',
        paddingOverride: '0px 8px 0px 0px',
        Cell: ({ cell: { row } }) => {
            const denom = row.original.assets[0].denom || 'uusd'
            const contract_addr =
                row.original.assets[0].contract_addr || undefined
            const provideClickHandler = useActionButtonClickHandler()
            const swapUrl =
                denom === 'uusd'
                    ? `${ASTROPORT_URL}?from=uluna&to=uusd`
                    : denom === 'uluna'
                    ? `${ASTROPORT_URL}?from=uusd&to=uluna`
                    : `${ASTROPORT_URL}?from=uusd&to=${contract_addr}`

            const buyClickHandler = provideClickHandler(
                ActionType.ExternalLink,
                denom,
                GridActionType.None,
                swapUrl
            )
            const { find } = useAccountBalance()
            const history = useHistory()
            const assetWallet = find(denom)
            const hasBalance = assetWallet?.amount > 0
            return (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    {hasBalance ? (
                        row.original.externalLink ? (
                            <Button
                                color='secondary'
                                text={'Farm'}
                                suffix={<ExternalSVG />}
                                externalLink={row.original.externalLink}
                            />
                        ) : (
                            <Button
                                text={'Farm'}
                                onClick={() => {
                                    history.push(`/fields/${row.original.key}`)
                                }}
                            />
                        )
                    ) : (
                        <Button
                            text={<Trans i18nKey='common.buy' />}
                            color='secondary'
                            suffix={<ExternalSVG />}
                            onClick={buyClickHandler}
                        />
                    )}
                </div>
            )
        },
    },
]

export const strategyGridInitialState = {
    sortBy: [
        {
            id: 'apy',
            desc: true,
        },
    ],
}
