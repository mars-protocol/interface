import Button from '../../components/Button'
import { ExternalSVG } from '../../components/Svg'
import { truncate } from '../../libs/text'

interface Props {
    hash: string
    link: string
}

const TxLink = ({ hash, link }: Props) => (
    <Button
        text={truncate(hash)}
        externalLink={link}
        suffix={<ExternalSVG />}
        size='medium'
        variant='transparent'
        styleOverride={{
            marginLeft: 'auto',
            marginRight: 'auto',
        }}
    />
)

export default TxLink
