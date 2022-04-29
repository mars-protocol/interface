import Chart, { helpers } from 'chart.js'
import { GAUGE_SCALE } from '../../../constants/appConstants'

const setUpDefaults = () => {
    Chart.defaults._set('radialGauge', {
        animation: {
            // Boolean - Whether we animate the rotation of the radialGauge
            animateRotate: true,
            // Boolean - Whether we animate scaling the radialGauge from the centre
            animateScale: true,
        },

        // Todo remove these out of the table
        // The percentage of the chart that is the center area
        centerPercentage: 95.5,

        maintainAspectRatio: true,
        circumference: Math.PI + 2,
        rotation: -Math.PI - 1,

        // the color of the radial gauge's track
        trackColor: '#1c1c1c',
        // whether arc for the gauge should have rounded corners
        roundedCorners: true,

        hover: {
            mode: 'disable',
        },
        options: {
            tooltips: {
                enabled: false,
            },
        },
        tooltips: {
            enabled: false,
        },

        legend: {
            display: false,
        },

        // the domain of the metric
        domain: [0, 100],
    })
}

const getCustomRadialGaugeController = () => {
    return Chart.controllers.doughnut.extend({
        // @ts-ignore
        dataElementType: Chart.elements.RoundedOverArc,
        linkScales: helpers.noop,

        draw: function (ease: any) {
            this.drawTrack()
            Chart.controllers.doughnut.prototype.draw.call(this, ease)
            this.drawDot()
        },

        drawTrack() {
            //@ts-ignore
            new Chart.elements.RoundedArc({
                _view: {
                    backgroundColor: this.chart.options.trackColor,
                    borderColor: this.chart.options.trackColor,
                    borderWidth: 0,
                    startAngle: this.chart.options.rotation,
                    endAngle: Math.PI * 0.33,
                    x: this.centerX,
                    y: this.centerY,
                    innerRadius: this.innerRadius,
                    outerRadius: this.outerRadius,
                    roundedCorners: true,
                },
                _chart: this.chart,
            }).draw()
        },

        drawDot() {
            const maxLtv = this.getDataset()['maxLtv']
            if (!maxLtv || maxLtv <= 0) {
                return
            }
            // Calculate the angle of our borrowing capacity
            const [domainStart, domainEnd] = this.getDomain() || [0, 100]
            const value = maxLtv * GAUGE_SCALE
            const domainSize = domainEnd - domainStart
            const limitAngle =
                domainSize > 0
                    ? Math.PI *
                      2.0 *
                      (Math.abs(value - domainStart) / domainSize)
                    : 0

            // Get the center of the arc
            const arcCentre = (this.outerRadius + this.innerRadius) / 2

            // Calculate offset from the centre of our circle
            const x =
                arcCentre * Math.cos(limitAngle + this.chart.options.rotation)
            const y =
                arcCentre * Math.sin(limitAngle + this.chart.options.rotation)

            // @ts-ignore
            new Chart.elements.Point({
                _view: {
                    radius: 2,
                    pointStyle: 'circle',
                    backgroundColor: '#c83333',
                    borderColor: '#c83333',
                    borderWidth: 1,
                    // Hover
                    hitRadius: 1,
                    hoverRadius: 4,
                    hoverBorderWidth: 1,
                    x: this.centerX + x,
                    y: this.centerY + y,
                },
                _chart: this.chart,
            }).draw()
        },

        update(reset: any) {
            const chart = this.chart
            const chartArea = chart.chartArea
            const opts = chart.options
            const arcOpts = opts.elements.arc
            const availableWidth =
                chartArea.right - chartArea.left - arcOpts.borderWidth
            const availableHeight =
                chartArea.bottom - chartArea.top - arcOpts.borderWidth
            const availableSize = Math.min(availableWidth, availableHeight)

            const meta = this.getMeta()
            const centerPercentage = opts.centerPercentage

            this.borderWidth = this.getMaxBorderWidth(meta.data)
            this.outerRadius = Math.max(
                (availableSize - this.borderWidth) / 2,
                0
            )
            this.innerRadius = Math.max(
                centerPercentage
                    ? (this.outerRadius / 100) * centerPercentage
                    : 0,
                0
            )

            meta.total = this.getMetricValue()
            this.centerX = (chartArea.left + chartArea.right) / 2
            this.centerY = (chartArea.top + chartArea.bottom) / 2

            helpers.each(meta.data, (arc: any, index: any) => {
                this.updateElement(arc, index, reset)
            })
        },

        updateElement(arc: any, index: any, reset: any) {
            const chart = this.chart
            const chartArea = chart.chartArea
            const opts = chart.options
            const animationOpts = opts.animation
            const centerX = (chartArea.left + chartArea.right) / 2
            const centerY = (chartArea.top + chartArea.bottom) / 2
            const startAngle = opts.rotation // non reset case handled later
            const dataset = this.getDataset()
            const arcAngle =
                reset && animationOpts.animateRotate
                    ? 0
                    : this.calculateArcAngle(dataset.data[index])
            const value =
                reset && animationOpts.animateScale ? 0 : this.getMetricValue()
            const endAngle = startAngle + arcAngle // arcAngle
            const innerRadius = this.innerRadius
            const outerRadius = this.outerRadius
            const valueAtIndexOrDefault = helpers.valueAtIndexOrDefault

            helpers.extend(arc, {
                // Utility
                _datasetIndex: this.index,
                _index: index,

                // Desired view properties
                _model: {
                    x: centerX,
                    y: centerY,
                    startAngle,
                    endAngle,
                    outerRadius,
                    innerRadius,
                    label: valueAtIndexOrDefault(
                        dataset.label,
                        index,
                        chart.data.labels[index]
                    ),
                    roundedCorners: opts.roundedCorners,
                    value,
                },
            })

            const model = arc._model

            // Resets the visual styles
            const custom = arc.custom || {}
            const valueOrDefault = helpers.valueAtIndexOrDefault
            const elementOpts = this.chart.options.elements.arc
            model.backgroundColor = custom.backgroundColor
                ? custom.backgroundColor
                : valueOrDefault(
                      dataset.backgroundColor,
                      index,
                      elementOpts.backgroundColor
                  )
            model.borderColor = custom.borderColor
                ? custom.borderColor
                : valueOrDefault(
                      dataset.borderColor,
                      index,
                      elementOpts.borderColor
                  )
            model.borderWidth = custom.borderWidth
                ? custom.borderWidth
                : valueOrDefault(
                      dataset.borderWidth,
                      index,
                      elementOpts.borderWidth
                  )

            arc.pivot()
        },

        getMetricValue() {
            let value = this.getDataset().data[0]
            if (value == null) {
                value = this.chart.options.domain[0] || 0
            }

            return value
        },

        getDomain() {
            return this.chart.options.domain
        },

        calculateArcAngle() {
            const [domainStart, domainEnd] = this.getDomain() || [0, 100]
            const value = this.getMetricValue()
            const domainSize = domainEnd - domainStart
            return domainSize > 0
                ? Math.PI * 2.0 * (Math.abs(value - domainStart) / domainSize)
                : 0
        },

        // gets the max border or hover width to properly scale pie charts
        getMaxBorderWidth(arcs: any) {
            let max = 0
            const index = this.index
            const length = arcs.length
            let borderWidth
            let hoverWidth

            for (let i = 0; i < length; i++) {
                borderWidth = arcs[i]._model ? arcs[i]._model.borderWidth : 0
                hoverWidth = arcs[i]._chart
                    ? arcs[i]._chart.config.data.datasets[index]
                          .hoverBorderWidth
                    : 0

                max = borderWidth > max ? borderWidth : max
                max = hoverWidth > max ? hoverWidth : max
            }
            return max
        },
    })
}

export {
    getCustomRadialGaugeController as RadialGaugeController,
    setUpDefaults,
}
