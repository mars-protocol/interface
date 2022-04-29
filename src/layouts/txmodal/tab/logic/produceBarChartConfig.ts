const produce_Y_AxisColor = (assetData: Array<number>) => {
    const length = assetData.length
    var colors: Array<string> = []

    var count = 0
    while (count < length) {
        colors.push('rgba(0, 0, 0, 0)')
        count += 1
    }

    colors.push('#76777b')

    return colors
}

export const produceBarChartConfig = (percentData: Array<number>) => {
    return {
        font: {
            family: 'Inter',
        },
        tooltips: {
            enabled: false,
        },
        legend: {
            display: false,
        },
        scales: {
            xAxes: [
                {
                    ticks: {
                        max: 100,
                        beginAtZero: true,
                        callback: (value: any) => {
                            if (value < 100) {
                                return ''
                            }
                            return `${value.toFixed(0)}%`
                        },
                        fontFamily: 'Inter',
                        fontSize: 11,
                        style: 'bold',
                    },

                    gridLines: {
                        offset: false,
                        display: true,
                        drawBorder: true,
                        zeroLineWidth: 1,
                        lineWidth: 0,
                        drawTicks: false,
                        drawOnChartArea: true,
                        color: [
                            'rgba(0, 0, 0, 0)',
                            'rgba(0, 0, 0, 0)',
                            'rgba(0, 0, 0, 0)',
                            'rgba(0, 0, 0, 0)',
                            'rgba(0, 0, 0, 0)',
                            'rgba(0, 0, 0, 0)',
                        ],
                        zeroLineColor: '#76777b',
                        borderWidth: 0,
                    },
                },
            ],
            yAxes: [
                {
                    ticks: {
                        mirror: false,
                        callback: (value: any) => {
                            return `${value}     `
                        },

                        fontFamily: 'Inter',
                        fontSize: 11,
                        style: 'bold',
                        fontColor: '#aba3a9',
                    },
                    // gridLines: {
                    //     display: false
                    // }
                    gridLines: {
                        offset: false,
                        display: true,
                        // drawBorder: true,
                        zeroLineWidth: 1,
                        lineWidth: 1,
                        drawTicks: false,
                        drawOnChartArea: true,
                        color: produce_Y_AxisColor(percentData),
                        zeroLineColor: 'rgba(0, 0, 0, 0)',
                        borderWidth: 0,
                    },
                },
            ],
        },
    }
}
