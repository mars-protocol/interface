import React, { useEffect, useMemo, useState } from 'react'

import { Doughnut, defaults } from 'react-chartjs-2'

import styles from './DonutGraph.module.scss'
import DonutHover from './charts/DonutHover'
import { producePercentData } from '../../libs/assetInfo'
import Tippy from '@tippyjs/react'
import { formatValue } from '../../libs/parse'
defaults.global.defaultFontFamily = 'Inter'

function hexToRgb(hex: any) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null
}

// Create a gradient to use on our chart. This is essentially a circular border around the slice(s)
function createGrad(
    ctx: any,
    canvasWidth: number,
    canvasHeight: number,
    colorOne: string,
    colorTwo = '#1b1d24',
    opacityTwo = 0.35
) {
    let opacityOne = 1,
        colorStop = 92
    var rgbOne = hexToRgb(colorOne)
    var rgbTwo = hexToRgb(colorTwo)
    colorStop = colorStop / 100

    var grd = ctx
        .getContext('2d')
        .createRadialGradient(
            canvasWidth / 2,
            canvasHeight / 2,
            0.0,
            canvasWidth / 2,
            canvasHeight / 2,
            canvasHeight / 2
        )

    if (rgbOne == null || rgbTwo == null) {
        return null
    }

    // Add color stops to the gradient
    grd.addColorStop(
        0.0,
        'rgba(' +
            rgbOne.r +
            ', ' +
            rgbOne.g +
            ', ' +
            rgbOne.b +
            ', ' +
            opacityOne +
            ')'
    )
    grd.addColorStop(
        colorStop,
        'rgba(' +
            rgbOne.r +
            ', ' +
            rgbOne.g +
            ', ' +
            rgbOne.b +
            ', ' +
            opacityOne +
            ')'
    )
    grd.addColorStop(
        0.94,
        'rgba(' +
            rgbTwo.r +
            ', ' +
            rgbTwo.g +
            ', ' +
            rgbTwo.b +
            ', ' +
            opacityTwo +
            ')'
    ) // required to prevent jagged edges
    grd.addColorStop(
        1.0,
        'rgba(' +
            rgbTwo.r +
            ', ' +
            rgbTwo.g +
            ', ' +
            rgbTwo.b +
            ', ' +
            opacityTwo +
            ')'
    )

    return grd
}

function generateColors(mychart: any, defaultColors: any[]) {
    if (mychart == null) {
        return defaultColors
    }

    return defaultColors.map((color) =>
        createGrad(
            mychart.chartInstance.ctx.canvas,
            mychart.chartInstance.width,
            mychart.chartInstance.height,
            color,
            '#1b1d24',
            0.0
        )
    )
}

function generateHoverColors(mychart: any, defaultColors: any[]) {
    if (mychart == null) {
        return defaultColors
    }

    return defaultColors.map((color) =>
        createGrad(
            mychart.chartInstance.ctx.canvas,
            mychart.chartInstance.width,
            mychart.chartInstance.height,
            color,
            color
        )
    )
}

interface Props {
    title: string
    placeholderTitle?: string
    value: number
    cutoutPercentage: number
    labels: string[]
    data: AssetInfo[]
    colors: string[]
    expandableOnHover?: boolean
    labelsOnHover?: boolean
    styleOverride: Object
}

const DonutGraph = ({
    title,
    value,
    cutoutPercentage,
    labels,
    data,
    colors,
    expandableOnHover = true,
    labelsOnHover = true,
    styleOverride,
}: Props) => {
    const [showToolTip, setShowToolTip] = useState(false)
    const [myChart, setMyChart] = useState()
    const _chartRef: any = React.createRef()

    useEffect(() => {
        setMyChart(_chartRef.current)
    }, [_chartRef])
    const colorsToAdd = generateColors(myChart, colors)
    const hoverColors = generateHoverColors(myChart, colors)

    const percentData = useMemo(() => producePercentData(data), [data])

    // Set up our dataset based on whether we require expandable sections on hover
    const chartHasData = useMemo(() => data.some((d) => !!d), [data])

    const datasetToAdd = chartHasData
        ? [
              {
                  data: percentData,
                  backgroundColor: expandableOnHover ? colorsToAdd : colors,
                  hoverBackgroundColor: expandableOnHover
                      ? hoverColors
                      : colors,
                  borderWidth: 0,
              },
          ]
        : [
              {
                  data: [100],
                  backgroundColor: expandableOnHover
                      ? generateColors(myChart, ['#3a3c49'])
                      : ['#3a3c49'],
                  hoverBackgroundColor: expandableOnHover
                      ? generateHoverColors(myChart, ['#3a3c49'])
                      : ['#3a3c49'],
                  borderWidth: 0,
              },
          ]

    const chartData = {
        labels: labels,
        datasets: datasetToAdd,
    }

    const chartOptions = {
        tooltips: {
            enabled: false,
            custom: (tooltipModel: any) => {
                if (!chartHasData || !labelsOnHover) return
                // if chart is not defined, return early
                var chart: any = _chartRef.current
                if (!chart) {
                    return
                }

                // hide the tooltip when chartjs determines you've hovered out
                if (tooltipModel.opacity <= 0) {
                    setShowToolTip(false)
                    return
                }
                setShowToolTip(true)
            },
        },
        legend: {
            display: false,
        },
        cutoutPercentage: cutoutPercentage,
        maintainAspectRatio: true,
        circumference: Math.PI * 2,
        rotation: 0,
    }

    return (
        <div className={styles.container}>
            {showToolTip && expandableOnHover && (
                <Tippy content={<DonutHover title={title} data={data} />}>
                    <div className={styles.overlay} />
                </Tippy>
            )}
            <div style={styleOverride}>
                <Doughnut
                    data={chartData}
                    options={chartOptions}
                    ref={_chartRef}
                />
                <div className={styles.innerText}>
                    {
                        <div>
                            <span>$</span>
                            <span className={'h4'}>
                                {formatValue(Number(value), 2, 2, true, false)}
                            </span>
                        </div>
                    }
                </div>
                <div className={styles.title}>
                    <p className={'sub2'}>{title}</p>
                </div>
            </div>
        </div>
    )
}

export default DonutGraph
