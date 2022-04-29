import { UST_DENOM, UST_DECIMALS } from '../../../constants/appConstants'
import { lookup } from '../../../libs/parse'
import CollectionHover, { HoverItem } from '../../CollectionHover'

interface Props {
    data: AssetInfo[]
    title: string
}

const DonutHover = ({ data, title }: Props) => {
    const produceData = (data: AssetInfo[]): HoverItem[] => {
        const items: HoverItem[] = []

        data.forEach((asset: AssetInfo) => {
            if (Number(asset.uusdBalance) > 0) {
                items.push({
                    color: asset.color || '',
                    name: asset.symbol || '',
                    amount: lookup(
                        Number(asset.balance),
                        asset.denom,
                        asset.decimals
                    ),
                    usdValue: lookup(
                        asset.uusdBalance || 0,
                        UST_DENOM,
                        UST_DECIMALS
                    ),
                })
            }
        })
        return items
    }

    return <CollectionHover title={title} data={produceData(data)} />
}

export default DonutHover
