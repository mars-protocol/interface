import { Coin } from '@cosmjs/stargate'
import { formatValue } from 'libs/parse'
import useStore from 'store'

interface Props {
  coins: Coin[]
  valueClass?: string
}

export const BaseCurrency = ({ coins, valueClass }: Props) => {
  const baseCurrency = useStore((s) => s.baseCurrency)
  const convertToBaseCurrency = useStore((s) => s.convertToBaseCurrency)

  const amount = coins.reduce((prev, curr) => prev + convertToBaseCurrency(curr), 0)

  return (
    <p className={`${valueClass} number`}>
      {`${formatValue(amount / 10 ** baseCurrency.decimals, 2, 2, true)} ${baseCurrency.symbol}`}
    </p>
  )
}
