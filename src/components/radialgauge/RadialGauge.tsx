import 'create-conical-gradient'
import ChartComponent from 'react-chartjs-2'
import styles from './RadialGauge.module.scss'
import Chart from 'chart.js'

import produceValueArc, { GradientValue } from './elements/ValueArc'
import {
    setUpDefaults,
    RadialGaugeController,
} from './controllers/RadialGaugeController'
import { ReactNode } from 'react'
import produceTrackArc from './elements/TrackArc'
import { GAUGE_SCALE } from '../../constants/appConstants'
import { formatValue } from '../../libs/parse'

interface Props {
    currentLtv: number
    maxLtv: number
    maxValue: number
    generateText: (limit: number) => ReactNode
    showMaxValue: boolean
    colorStops: Array<GradientValue>
    showDot: boolean
    maxTextPrefix?: string
    maxTextTitle?: string
}

const RadialGauge = ({
    currentLtv,
    maxLtv,
    maxValue,
    generateText,
    showMaxValue,
    colorStops,
    showDot = true,
    maxTextPrefix = '$',
    maxTextTitle = 'MAX',
}: Props) => {
    Chart.defaults.radialGauge = Chart.defaults.doughnut

    setUpDefaults()
    // @ts-ignore : Chart.elements is not exposed on the d.ts file for chart.js
    Chart.elements.RoundedOverArc = produceValueArc(colorStops)
    //@ts-ignore
    Chart.elements.RoundedArc = produceTrackArc(currentLtv > 0)
    var controller = RadialGaugeController()

    // todo enable tooltips when we have the finalised specification for them
    Chart.defaults.global.tooltips.enabled = false
    Chart.controllers.radialGauge = controller

    const chartData = {
        datasets: [
            {
                // This is the value we want to show
                data: [(currentLtv > 100 ? 100 : currentLtv) * GAUGE_SCALE],
                borderWidth: 0,
                maxLtv: maxLtv,
            },
        ],
    }

    return (
        <div className={styles.container}>
            <div className={styles.glow}>
                <ChartComponent
                    data={chartData}
                    // We can do this because of https://github.com/jerairrest/react-chartjs-2/blob/master/src/index.js#L25
                    // where it is checking the Chart.js instance for a controller that matches the type.
                    // Typescript will complain however because it is not one of the preconfigured charts in react-chart-js.
                    //@ts-ignore
                    type='radialGauge'
                />
            </div>
            <div className={styles.dialContainer}>
                <ChartComponent
                    data={chartData}
                    //@ts-ignore - see comment above
                    type='radialGauge'
                />
            </div>
            {generateText(currentLtv ?? 0)}

            {showMaxValue ? (
                <div className={styles.maxText}>
                    <span className={`caption ${styles.caption}`}>
                        {maxTextTitle}
                    </span>
                    <span className={'sub2'} style={{ opacity: '1' }}>
                        {maxTextPrefix}
                        {formatValue(maxValue, 2, 2, true, false, true, true)}
                    </span>
                </div>
            ) : null}
        </div>
    )
}

export default RadialGauge
