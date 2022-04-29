import styles from './Fields.module.scss'
import Overview from './layouts/Overview'
import Strategies from './layouts/Strategies'
import {
    activeStrategyGridColumns,
    activeStrategyGridInitialState,
    strategyGridColumns,
    strategyGridInitialState,
} from './gridConfig'
import { BasecampProvider, useBasecampState } from '../../hooks/useBasecamp'

import { useFieldsState, FieldsProvider } from '../../hooks/useFields'
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Route, Switch } from 'react-router-dom'
import Strategy from './layouts/modaltab/Strategy'
import { SwapProvider, useSimulateSwapState } from '../../hooks/useSimulateSwap'
import FieldsIntroduction from './components/FieldsIntroduction'

const Fields = () => {
    const { t } = useTranslation()
    const basecamp = useBasecampState()
    const fieldsState = useFieldsState()
    const [loaded, setLoaded] = useState(false)
    const [strategiesCount, setStrategiesCount] = useState(0)
    const [activeStrategiesData, setActiveStrategiesData] = useState<
        StrategyObject[]
    >([])
    const [strategiesData, setStrategiesData] = useState<StrategyObject[]>([])

    const showAvailableStrategies = !(
        loaded && strategiesCount === activeStrategiesData.length
    )

    useEffect(
        () => {
            if (fieldsState.strategies?.length) {
                setStrategiesCount(fieldsState.strategies.length)
                const newActive: StrategyObject[] = []
                const newAvailable: StrategyObject[] = []
                fieldsState.strategies?.forEach((strategy: StrategyObject) => {
                    if (Number(strategy.position?.bond_units) > 0) {
                        newActive.push(strategy)
                    } else {
                        newAvailable.push(strategy)
                    }
                })

                setLoaded(true)
                setActiveStrategiesData(newActive)
                setStrategiesData(newAvailable)
            }
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [fieldsState.strategies, loaded]
    )

    useEffect(
        () => {
            setActiveStrategiesData([])
            setStrategiesData([])
            setLoaded(false)
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    const simulateSwapState = useSimulateSwapState()
    return (
        <BasecampProvider value={basecamp}>
            <SwapProvider value={simulateSwapState}>
                <div className={styles.fields}>
                    <Switch>
                        <Route exact={true} path='/fields'>
                            {activeStrategiesData.length > 0 ? (
                                <>
                                    <Overview data={activeStrategiesData} />
                                    <Strategies
                                        loaded={loaded}
                                        title={t('fields.myActiveStrategies')}
                                        columns={activeStrategyGridColumns}
                                        data={activeStrategiesData}
                                        initialState={
                                            activeStrategyGridInitialState
                                        }
                                        active={true}
                                        ttCopy={
                                            <Trans i18nKey='fields.myActiveStrategiesManageTooltip' />
                                        }
                                    />
                                </>
                            ) : (
                                loaded && <FieldsIntroduction />
                            )}

                            {showAvailableStrategies && (
                                <Strategies
                                    loaded={loaded}
                                    title={t('fields.availableStrategies')}
                                    columns={strategyGridColumns}
                                    data={strategiesData}
                                    active={false}
                                    initialState={strategyGridInitialState}
                                    separator={t('common.notInYourWallet')}
                                    showMore={strategiesData.length > 10}
                                    ttCopy={t(
                                        'fields.availableStrategiesTooltip'
                                    )}
                                />
                            )}
                        </Route>
                        <Route exact={false} path='/fields/:key'>
                            <FieldsProvider value={fieldsState}>
                                {
                                    fieldsState.strategies ? <Strategy /> : null //todo 404
                                }
                            </FieldsProvider>
                        </Route>
                    </Switch>
                </div>
            </SwapProvider>
        </BasecampProvider>
    )
}

export default Fields
