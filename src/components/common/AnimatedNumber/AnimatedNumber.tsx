import classNames from 'classnames'
import { formatValue } from 'libs/parse'
import isEqual from 'lodash.isequal'
import React, { useEffect, useRef } from 'react'
import { animated, useSpring } from 'react-spring'
import useStore from 'store'

interface AnimatedNumberProps {
  amount: number
  minDecimals?: number
  maxDecimals?: number
  thousandSeparator?: boolean
  prefix?: boolean | string
  suffix?: boolean | string
  rounded?: boolean
  abbreviated?: boolean
  className?: string
}

export const AnimatedNumber = React.memo(
  ({
    amount,
    minDecimals = 2,
    maxDecimals = 2,
    thousandSeparator = true,
    prefix = false,
    suffix = false,
    rounded = false,
    abbreviated = true,
    className,
  }: AnimatedNumberProps) => {
    const prevAmountRef = useRef<number>(0)
    const enableAnimations = useStore((s) => s.enableAnimations)

    useEffect(() => {
      if (prevAmountRef.current !== amount) prevAmountRef.current = amount
    }, [amount])

    const springAmount = useSpring({
      number: amount,
      from: { number: prevAmountRef.current },
      config: { duration: 1000 },
    })

    return prevAmountRef.current === amount || !enableAnimations ? (
      <span className={classNames('number', className)}>
        {formatValue(
          amount,
          minDecimals,
          maxDecimals,
          thousandSeparator,
          prefix,
          suffix,
          rounded,
          abbreviated,
        )}
      </span>
    ) : (
      <animated.span className={classNames('number', className)}>
        {springAmount.number.to((num) =>
          formatValue(
            num,
            minDecimals,
            maxDecimals,
            thousandSeparator,
            prefix,
            suffix,
            rounded,
            abbreviated,
          ),
        )}
      </animated.span>
    )
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
)

AnimatedNumber.displayName = 'AnimatedNumber'
