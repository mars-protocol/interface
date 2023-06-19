import { Coin } from '@cosmjs/proto-signing'
import { AnimatedNumber } from 'components/common'
import { useAsset } from 'hooks/data'
import { lookup } from 'libs/parse'

interface Props {
  coin: Coin
  maxDecimals?: number
  showSymbol?: boolean
  className?: string
}

export const TokenBalance = (props: Props) => {
  const asset = useAsset({ denom: props.coin?.denom })
  const amount = !props.coin || !asset ? 0 : Number(props.coin?.amount || 0)

  const lookupAmount = !asset ? 0 : lookup(amount, asset.symbol, asset.decimals)
  const amountDecimals = lookupAmount.toString().split('.')
  const decimals = typeof amountDecimals[1] === 'undefined' ? 0 : amountDecimals[1].length

  if (!asset) return <span>0</span>

  return (
    <AnimatedNumber
      amount={lookupAmount}
      maxDecimals={props.maxDecimals ? props.maxDecimals : decimals}
      minDecimals={0}
      suffix={props.showSymbol && ` ${asset.symbol}`}
      abbreviated={false}
      className={props.className}
      rounded
    />
  )
}
