import { UST_DECIMALS, UST_DENOM } from '../../constants/appConstants'
import { formatValue, lookup } from '../../libs/parse'

interface Props {
    denom: string
    decimals: number
    amount: number
    uusdAmount: number
}

const CellAmount = ({ denom, decimals, amount, uusdAmount }: Props) => {
    const usdAmount = lookup(uusdAmount, UST_DENOM, UST_DECIMALS)
    const assetAmount = lookup(amount, denom, decimals)
    return (
        <div>
            {denom !== 'uusd'
                ? formatValue(
                      assetAmount > 0 && assetAmount < 0.01
                          ? 0.01
                          : assetAmount,
                      2,
                      2,
                      true,
                      assetAmount > 0 && assetAmount < 0.01 ? '< ' : false
                  )
                : null}
            <div
                style={{
                    opacity: denom !== 'uusd' ? 0.6 : 1,
                }}
                className={denom !== 'uusd' ? 'caption' : ''}
            >
                <span>
                    {formatValue(
                        usdAmount > 0 && usdAmount < 0.01 ? 0.01 : usdAmount,
                        2,
                        2,
                        true,
                        usdAmount > 0 && usdAmount < 0.01 ? '< $' : '$'
                    )}
                </span>
            </div>
        </div>
    )
}

export default CellAmount
