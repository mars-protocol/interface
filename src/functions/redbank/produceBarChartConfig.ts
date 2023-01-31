export const produceBarChartConfig = (percentData: Array<number>) => {
  return {
    indexAxis: 'y' as const,
    maintainAspectRatio: false,
    responsive: true,
    events: [],
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          drawBorder: false,
          display: false,
        },
        min: 0,
        max: 100,
        ticks: {
          beginAtZero: true,
          stepSize: 10,
          fontFamily: 'Inter',
          fontSize: 11,
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: (value: any) => {
            if (value < 100) {
              if (value === 0) return '0'
              return ''
            }
            return `${value.toFixed(0)}%`
          },
        },
      },
      y: {
        grid: {
          drawBorder: false,
          display: false,
        },
      },
    },
  }
}
