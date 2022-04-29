interface Props {
    symbol: string
    name: string
}

const Asset = ({ symbol, name }: Props) => {
    return (
        <div>
            <div>{symbol}</div>
            <div style={{ opacity: 0.6 }} className='caption'>
                {name}
            </div>
        </div>
    )
}

export default Asset
