import { ChainInfoID } from '@marsprotocol/wallet-connector'
import { CHAIN_ID_KEY, SUPPORTED_CHAINS } from 'constants/appConstants'

export const getCurrentChainId = () => {
  let chainId = SUPPORTED_CHAINS[0].chainId

  if (window) {
    const subdomain = window.location.hostname.split('.')[0]

    switch (subdomain) {
      case 'osmosis':
        chainId = ChainInfoID.Osmosis1
        break

      case 'neutron':
        chainId = ChainInfoID.Neutron
        break

      case 'testnet-osmosis':
        chainId = ChainInfoID.OsmosisDevnet
        break

      case 'testnet-neutron':
        chainId = ChainInfoID.NeutronTestnet
        break
    }

    if (chainId != SUPPORTED_CHAINS[0].chainId) return chainId
  }

  if (localStorage.getItem(CHAIN_ID_KEY) !== null) {
    const isValidChainId = SUPPORTED_CHAINS.find(
      (chain) => chain.chainId === localStorage.getItem(CHAIN_ID_KEY),
    )
    if (isValidChainId) chainId = localStorage.getItem(CHAIN_ID_KEY) as ChainInfoID
  }

  return chainId
}
