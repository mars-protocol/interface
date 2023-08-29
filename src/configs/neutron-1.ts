import { ChainInfoID } from '@marsprotocol/wallet-connector'
import atom from 'images/atom.svg'
import axlusdc from 'images/axlusdc.svg'
import mars from 'images/mars.svg'
import ntrn from 'images/ntrn.svg'
import osmo from 'images/osmo.svg'
import statom from 'images/statom.svg'
import colors from 'styles/_assets.module.scss'

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
  axlusdc: {
    symbol: 'USDC.axl',
    name: 'Axelar USDC',
    id: 'axlUSDC',
    denom: 'ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349',
    color: colors.usdc,
    decimals: 6,
    logo: axlusdc,
    priceFeedId: 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
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
  statom: {
    symbol: 'stATOM',
    name: 'Stride Atom',
    id: 'stATOM',
    denom: 'ibc/B7864B03E1B9FD4F049243E92ABD691586F682137037A9F3FCA5222815620B3C',
    color: colors.statom,
    logo: statom,
    decimals: 6,
  },
}

const OTHER_ASSETS: { [denom: string]: OtherAsset } = {
  mars: {
    symbol: 'MARS',
    id: 'MARS',
    name: 'Mars',
    denom: 'ibc/9598CDEB7C6DB7FC21E746C8E0250B30CD5154F39CA111A9D4948A4362F638BD',
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
  name: ChainInfoID.Neutron,
  displayName: 'Neutron',
  hiveUrl:
    process.env.NEXT_PUBLIC_NEUTRON_GQL ??
    'https://neutron.rpc.p2p.world/qgrnU6PsQZA8F9S5Fb8Fn3tV3kXmMBl2M9bcc9jWLjQy8p/hive/graphql',
  rpcUrl: process.env.NEXT_PUBLIC_NEUTRON_RPC ?? 'https://rpc-kralum.neutron-1.neutron.org',
  restUrl: process.env.NEXT_PUBLIC_NEUTRON_REST ?? 'https://rest-kralum.neutron-1.neutron.org',
  usdPriceUrl: 'https://xc-mainnet.pyth.network/api/',
  chainIcon: ntrn,
  contracts: {
    redBank: 'neutron1n97wnm7q6d2hrcna3rqlnyqw2we6k0l8uqvmyqq6gsml92epdu7quugyph',
    incentives: 'neutron1aszpdh35zsaz0yj80mz7f5dtl9zq5jfl8hgm094y0j0vsychfekqxhzd39',
    oracle: 'neutron1dwp6m7pdrz6rnhdyrx5ha0acsduydqcpzkylvfgspsz60pj2agxqaqrr7g',
    pyth: 'neutron1m2emc93m9gpwgsrsf2vylv9xvgqh654630v7dfrhrkmr5slly53spg85wv',
  },
  assets: {
    base: ASSETS.ntrn,
    whitelist: [ASSETS.axlusdc, ASSETS.ntrn, ASSETS.atom, ASSETS.statom],
    other: [OTHER_ASSETS.usd, OTHER_ASSETS.mars, OTHER_ASSETS.osmo],
    currencies: [
      OTHER_ASSETS.usd,
      ASSETS.axlusdc,
      ASSETS.ntrn,
      ASSETS.atom,
      ASSETS.statom,
      OTHER_ASSETS.mars,
    ],
  },
  displayCurrency: OTHER_ASSETS.usd,
  appUrl: 'https://neutron.astroport.fi/swap',
  isFieldsEnabled: false,
  hasMultiAssetIncentives: true,
}

export const VAULT_CONFIGS: Vault[] = []
