import ConnectButton from '../components/header/ConnectButton'
import ConnectedButton from '../components/header/ConnectedButton'
import useStore from '../store'

const Connect = () => {
    const userWalletAddress = useStore((s) => s.userWalletAddress)

    return !userWalletAddress ? (
        <ConnectButton />
    ) : (
        <ConnectedButton address={userWalletAddress} />
    )
}

export default Connect
