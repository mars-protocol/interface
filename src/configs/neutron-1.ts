import atom from 'images/atom.svg'
import axlusdc from 'images/axlusdc.svg'
import axlweth from 'images/axlweth.svg'
import dydx from 'images/dydx.svg'
import mars from 'images/mars.svg'
import ntrn from 'images/ntrn.svg'
import osmo from 'images/osmo.svg'
import statom from 'images/statom.svg'
import stkatom from 'images/stkatom.svg'
import wsteth from 'images/wsteth.svg'
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
  stkatom: {
    symbol: 'stkATOM',
    id: 'stkATOM',
    name: 'Persistence Staked Atom',
    denom: 'ibc/3649CE0C8A2C79048D8C6F31FF18FA69C9BC7EB193512E0BD03B733011290445',
    logo: stkatom,
    color: colors.stkatom,
    decimals: 6,
  },
  axlweth: {
    symbol: 'WETH.axl',
    id: 'axlWETH',
    name: 'Axelar Wrapped Ethereum',
    denom: 'ibc/A585C2D15DCD3B010849B453A2CFCB5E213208A5AB665691792684C26274304D',
    color: colors.weth,
    logo: axlweth,
    decimals: 18,
    priceFeedId: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  },
  wsteth: {
    symbol: 'wstETH',
    id: 'wstETH',
    name: 'Lido Wrapped Staked Ethereum',
    denom: 'factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH',
    color: colors.wsteth,
    logo: wsteth,
    decimals: 18,
    priceFeedId: '6df640f3b8963d8f8358f791f352b8364513f6ab1cca5ed3f1f7b5448980e784',
  },
  dydx: {
    symbol: 'DYDX',
    id: 'DYDX',
    name: 'DyDx',
    denom: 'ibc/2CB87BCE0937B1D1DFCEE79BE4501AAF3C265E923509AEAC410AD85D27F35130',
    logo: dydx,
    color: colors.dydx,
    decimals: 18,
    priceFeedId: '6489800bb8974169adfe35937bf6736507097d13c190d760c557108c7e93a81b',
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
  name: ChainInfoID.Neutron1,
  displayName: 'Neutron',
  hiveUrl:
    process.env.NEXT_PUBLIC_NEUTRON_GQL ??
    'https://neutron.rpc.p2p.world/qgrnU6PsQZA8F9S5Fb8Fn3tV3kXmMBl2M9bcc9jWLjQy8p/hive/graphql',
  rpcUrl: process.env.NEXT_PUBLIC_NEUTRON_RPC ?? 'https://rpc-kralum.neutron-1.neutron.org',
  restUrl: process.env.NEXT_PUBLIC_NEUTRON_REST ?? 'https://rest-kralum.neutron-1.neutron.org',
  usdPriceUrl: 'https://hermes.pyth.network/api/',
  chainIcon: ntrn,
  contracts: {
    redBank: 'neutron1n97wnm7q6d2hrcna3rqlnyqw2we6k0l8uqvmyqq6gsml92epdu7quugyph',
    incentives: 'neutron1aszpdh35zsaz0yj80mz7f5dtl9zq5jfl8hgm094y0j0vsychfekqxhzd39',
    oracle: 'neutron1dwp6m7pdrz6rnhdyrx5ha0acsduydqcpzkylvfgspsz60pj2agxqaqrr7g',
    pyth: 'neutron1m2emc93m9gpwgsrsf2vylv9xvgqh654630v7dfrhrkmr5slly53spg85wv',
  },
  assets: {
    base: ASSETS.ntrn,
    whitelist: [
      ASSETS.axlusdc,
      ASSETS.ntrn,
      ASSETS.atom,
      ASSETS.statom,
      ASSETS.stkatom,
      ASSETS.axlweth,
      ASSETS.wsteth,
      ASSETS.dydx,
    ],
    other: [OTHER_ASSETS.usd, OTHER_ASSETS.mars, OTHER_ASSETS.osmo],
    currencies: [
      OTHER_ASSETS.usd,
      ASSETS.axlusdc,
      ASSETS.ntrn,
      ASSETS.atom,
      ASSETS.statom,
      ASSETS.stkatom,
      ASSETS.axlweth,
      ASSETS.wsteth,
      ASSETS.dydx,
      OTHER_ASSETS.mars,
    ],
  },
  displayCurrency: OTHER_ASSETS.usd,
  appUrl: 'https://neutron.astroport.fi/swap',
  isFieldsEnabled: false,
  hasMultiAssetIncentives: true,
}

export const VAULT_CONFIGS: Vault[] = []
