import { ChainInfoID } from '@marsprotocol/wallet-connector'

type Options = {
  from: Asset
  to: Asset
  baseUrl: string
  chain?: ChainInfoID
}

export const getSwapUrl = (options: Options) => {
  const { from, to, baseUrl, chain } = options
  let fromName: string
  let toName: string

  if (!chain) return '#'

  if (chain === ChainInfoID.Osmosis1 || chain === ChainInfoID.OsmosisDevnet) {
    fromName = from.id
    toName = to.id

    if (fromName === to.id) fromName = 'ATOM'
    if (to.id === 'axlUSDC') toName = 'USDC'
    if (to.id === 'axlWBTC') toName = 'WBTC'
    if (to.id === 'axlWETH') toName = 'ETH'

    return `${baseUrl}?from=${fromName}&to=${toName}`
  }

  if (chain === ChainInfoID.Neutron || chain === ChainInfoID.NeutronTestnet) {
    fromName = from.denom.replace('/', '%2F')
    toName = to.denom.replace('/', '%2F')
    return `${baseUrl}?from=${fromName}&to=${toName}`
  }
}
