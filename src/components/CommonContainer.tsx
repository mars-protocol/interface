import { useConnectedWallet, useWallet } from '@terra-money/wallet-provider'
import { ReactNode, useEffect } from 'react'
import networks from '../networks'
import useBlockHeightQuery from '../queries-new/BlockHeightQuery'
import useStore from '../store'

interface CommonContainerProps {
    children: ReactNode
}

const CommonContainer = ({ children }: CommonContainerProps) => {
    /**
     * Network configurations
     */
    const { network: extNetwork, status } = useWallet()
    const networkName = extNetwork.name
    const network = networks[networkName]
    const connectedWallet = useConnectedWallet()

    const isNetworkLoaded = useStore((s) => s.isNetworkLoaded)
    const setNetworkInfo = useStore((s) => s.setNetworkInfo)
    const setUserWalletAddress = useStore((s) => s.setUserWalletAddress)
    const setNetworkConfig = useStore((s) => s.setNetworkConfig)

    useEffect(() => {
        setNetworkConfig(network || extNetwork)
    }, [network, extNetwork, setNetworkConfig])

    useEffect(() => {
        setUserWalletAddress(connectedWallet?.terraAddress ?? '')
    }, [setUserWalletAddress, connectedWallet])

    useEffect(() => {
        setNetworkInfo(networkName, status)
    }, [networkName, status, setNetworkInfo])

    /**
     * Blockchain meta data
     */
    useBlockHeightQuery()

    return <>{isNetworkLoaded && children}</>
}

export default CommonContainer
