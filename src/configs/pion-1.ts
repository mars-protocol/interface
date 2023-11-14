import atom from 'images/atom.svg'
import axlusdc from 'images/axlusdc.svg'
import mars from 'images/mars.svg'
import ntrn from 'images/ntrn.svg'
import osmo from 'images/osmo.svg'
import colors from 'styles/_assets.module.scss'
import { ChainInfoID } from 'types/enums/wallet'

export const ASSETS: NetworkAssets = {
  ntrn: {
    symbol: 'NTRN',
    name: 'Neutron',
    id: 'NTRN',
    denom: 'untrn',
    color: colors.ntrn,
    logo: ntrn,
    decimals: 6,
    priceFeedId: 'a8e6517966a52cb1df864b2764f3629fde3f21d2b640b5c572fcd654cbccd65e',
  },
  atom: {
    symbol: 'ATOM',
    name: 'Atom',
    id: 'ATOM',
    denom: 'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9',
    color: colors.atom,
    logo: atom,
    decimals: 6,
    priceFeedId: 'b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
  },
  axlusdc: {
    symbol: 'USDC.axl',
    name: 'Axelar USDC',
    id: 'axlUSDC',
    denom: 'ibc/F91EA2C0A23697A1048E08C2F787E3A58AC6F706A1CD2257A504925158CFC0F3',
    color: colors.usdc,
    decimals: 6,
    logo: axlusdc,
    priceFeedId: 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  },
}

const OTHER_ASSETS: { [denom: string]: OtherAsset } = {
  mars: {
    symbol: 'MARS',
    id: 'MARS',
    name: 'Mars',
    denom: 'ibc/584A4A23736884E0C198FD1EE932455A9357A492A7B94324E4A02B5628687831',
    color: colors.mars,
    logo: mars,
    decimals: 6,
  },
  osmo: {
    symbol: 'OSMO',
    name: 'Osmosis',
    id: 'OSMO',
    denom: 'uosmo',
    color: colors.osmo,
    logo: osmo,
    decimals: 6,
    priceFeedId: '5867f5683c757393a0670ef0f701490950fe93fdb006d181c8265a831ac0c5c6',
  },
  usd: {
    symbol: '',
    prefix: '$',
    name: 'US Dollar',
    denom: 'usd',
    color: '',
    logo: '',
    decimals: 2,
  },
}

export const NETWORK_CONFIG: NetworkConfig = {
  name: ChainInfoID.NeutronTestnet,
  displayName: 'Neutron Testnet',
  hiveUrl:
    process.env.NEXT_PUBLIC_NEUTRON_TEST_GQL ??
    'https://testnet-neutron-gql.marsprotocol.io/graphql',
  rpcUrl: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech/',
  restUrl: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech/',
  usdPriceUrl: 'https://hermes.pyth.network/api/',
  chainIcon: ntrn,
  contracts: {
    redBank: 'neutron1q53jr6wwus0c6g5had2zs6fzzachu5zun0c6etxuyarh5w7phxpq4wf39z',
    incentives: 'neutron1pg2fxw87fkzfwyn8q45hes4mmlt4ywjg53hf655mh83edd9yq65quqe07u',
    oracle: 'neutron1u3lmzs3zhhhlvkmrnq9u4ep6pgqp3gxawt3xg82hl9jydwmug7jsgmhjrn',
    pyth: 'neutron1f86ct5az9qpz2hqfd5uxru02px2a3tz5zkw7hugd7acqq496dcms22ehpy',
  },
  assets: {
    base: ASSETS.ntrn,
    whitelist: [ASSETS.ntrn, ASSETS.atom, ASSETS.axlusdc],
    other: [OTHER_ASSETS.usd, OTHER_ASSETS.mars, OTHER_ASSETS.osmo],
    currencies: [OTHER_ASSETS.usd, ASSETS.ntrn, ASSETS.atom, ASSETS.axlusdc, OTHER_ASSETS.mars],
  },
  displayCurrency: OTHER_ASSETS.usd,
  appUrl: 'https://testnet-neutron.astroport.fi/swap',
  isFieldsEnabled: false,
  hasMultiAssetIncentives: true,
}

export const VAULT_CONFIGS: Vault[] = []
