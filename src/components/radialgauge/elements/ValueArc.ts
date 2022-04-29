export interface GradientValue {
    color: string
    value: number
}

const produceValueArc = (colorStops: Array<GradientValue>) => {
    //@ts-ignore
    return Chart.elements.Arc.extend({
        draw() {
            const ctx = this._chart.ctx
            const vm = this._view

            const { startAngle, endAngle } = vm
            if (vm.value === 0) {
                return
            }

            const cornerRadius = (vm.outerRadius - vm.innerRadius) / 2
            const cornerX = (vm.outerRadius + vm.innerRadius) / 2

            // translate + rotate to make drawing the corners simpler
            ctx.translate(vm.x, vm.y)
            ctx.rotate(startAngle)
            const angle = endAngle - startAngle
            ctx.beginPath()
            if (vm.roundedCorners) {
                ctx.arc(cornerX, 0, cornerRadius, Math.PI, 0)
            }
            ctx.arc(0, 0, vm.outerRadius, 0, angle)

            const x = cornerX * Math.cos(angle)
            const y = cornerX * Math.sin(angle)

            if (vm.roundedCorners) {
                ctx.arc(x, y, cornerRadius, angle, angle + Math.PI)
            }

            ctx.arc(0, 0, vm.innerRadius, angle, 0, true)
            ctx.closePath()
            ctx.rotate(-startAngle)
            ctx.translate(-vm.x, -vm.y)

            ctx.strokeStyle = vm.borderColor
            ctx.lineWidth = vm.borderWidth
            ctx.strokeStyle = vm.borderColor
            // create gradient and fill it
            const rotationOffSet = Math.PI * 0.5
            const gradient = ctx.createConicalGradient(
                vm.x,
                vm.y - 10,
                0 + rotationOffSet,
                Math.PI * 2 + rotationOffSet
            )

            for (var index = 0; index < colorStops.length; index += 1) {
                const colorStop = colorStops[index]
                gradient.addColorStop(colorStop.value, colorStop.color)
            }

            ctx.fillStyle = gradient.pattern

            ctx.strokeStyle = gradient
            ctx.fillStyle = gradient

            ctx.fill()
            ctx.lineJoin = 'bevel'

            if (vm.borderWidth) {
                ctx.stroke()
            }
        },
    })
}

export default produceValueArc
