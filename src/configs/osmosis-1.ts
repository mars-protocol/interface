import { ChainInfoID, WalletID } from '@marsprotocol/wallet-connector'
import { URL_GQL, URL_REST, URL_RPC } from 'constants/env'
import atom from 'images/atom.svg'
import axl from 'images/axl.svg'
import axlusdc from 'images/axlusdc.svg'
import axlwbtc from 'images/axlwbtc.svg'
import axlweth from 'images/axlweth.svg'
import mars from 'images/mars.svg'
import osmo from 'images/osmo.svg'
import statom from 'images/statom.svg'
import colors from 'styles/_assets.module.scss'

export const ASSETS: { [denom: string]: Asset } = {
  osmo: {
    symbol: 'OSMO',
    name: 'Osmosis',
    id: 'OSMO',
    denom: 'uosmo',
    color: colors.osmo,
    logo: osmo,
    decimals: 6,
  },
  axlusdc: {
    symbol: 'USDC.axl',
    name: 'Axelar USDC',
    id: 'axlUSDC',
    denom: 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
    color: colors.usdc,
    decimals: 6,
    logo: axlusdc,
  },
  axlwbtc: {
    symbol: 'WBTC.axl',
    id: 'axlWBTC',
    name: 'Axelar Wrapped Bitcoin',
    denom: 'ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F',
    color: colors.wbtc,
    logo: axlwbtc,
    decimals: 8,
  },
  axlweth: {
    symbol: 'WETH.axl',
    id: 'axlWETH',
    name: 'Axelar Wrapped Ethereum',
    denom: 'ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5',
    color: colors.weth,
    logo: axlweth,
    decimals: 18,
  },
  atom: {
    symbol: 'ATOM',
    name: 'Atom',
    id: 'ATOM',
    denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    color: colors.atom,
    logo: atom,
    decimals: 6,
  },
  axl: {
    symbol: 'AXL',
    name: 'Axelar',
    id: 'AXL',
    denom: 'ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E',
    color: colors.axl,
    logo: axl,
    decimals: 6,
  },
  statom: {
    symbol: 'stATOM',
    name: 'Stride Atom',
    id: 'stATOM',
    denom: 'ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901',
    color: colors.statom,
    logo: statom,
    decimals: 6,
    poolBase: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
  },
}

const OTHER_ASSETS: { [denom: string]: OtherAsset } = {
  mars: {
    symbol: 'MARS',
    name: 'Mars',
    denom: 'ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580',
    color: colors.mars,
    logo: mars,
    decimals: 6,
    poolId: 907,
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
  name: ChainInfoID.Osmosis1,
  hiveUrl:
    URL_GQL ?? 'https://osmosis-node.marsprotocol.io/GGSFGSFGFG34/osmosis-hive-front/graphql',
  rpcUrl: URL_RPC ?? 'https://rpc-osmosis.blockapsis.com/',
  restUrl: URL_REST ?? 'https://lcd-osmosis.blockapsis.com/',
  apolloAprUrl: 'https://api.apollo.farm/api/vault_infos/v2/osmosis-1',
  osmoUsdPriceUrl: 'https://api-osmosis.imperator.co/tokens/v2/OSMO',
  contracts: {
    redBank: 'osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg',
    incentives: 'osmo1nkahswfr8shg8rlxqwup0vgahp0dk4x8w6tkv3rra8rratnut36sk22vrm',
    oracle: 'osmo1mhznfr60vjdp2gejhyv2gax9nvyyzhd3z0qcwseyetkfustjauzqycsy2g',
    creditManager: 'osmo1f2m24wktq0sw3c0lexlg7fv4kngwyttvzws3a3r3al9ld2s2pvds87jqvf',
    accountNft: 'osmo1450hrg6dv2l58c0rvdwx8ec2a0r6dd50hn4frk370tpvqjhy8khqw7sw09',
  },
  assets: {
    base: ASSETS.osmo,
    whitelist: [
      ASSETS.osmo,
      ASSETS.atom,
      ASSETS.axl,
      ASSETS.axlusdc,
      ASSETS.axlwbtc,
      ASSETS.axlweth,
      ASSETS.statom,
    ],
    other: [OTHER_ASSETS.usd, OTHER_ASSETS.mars],
    currencies: [
      OTHER_ASSETS.usd,
      ASSETS.osmo,
      ASSETS.atom,
      ASSETS.axl,
      ASSETS.axlweth,
      ASSETS.axlwbtc,
      ASSETS.statom,
      OTHER_ASSETS.mars,
    ],
  },
  displayCurrency: OTHER_ASSETS.usd,
  appUrl: 'https://app.osmosis.zone',
  wallets: [
    WalletID.Keplr,
    WalletID.Xdefi,
    WalletID.StationWallet,
    WalletID.Leap,
    WalletID.Cosmostation,
    WalletID.KeplrMobile,
    WalletID.CosmostationMobile,
  ],
}

export const VAULT_CONFIGS: Vault[] = [
  {
    address: 'osmo1g3kmqpp8608szfp0pdag3r6z85npph7wmccat8lgl3mp407kv73qlj7qwp',
    name: { name: 'OSMO-ATOM LP', unlockDuration: 14, unlockTimeframe: 'days' },
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
      lpToken: 'gamm/pool/1',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'ATOM',
    },
    color: '#6f7390',
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description: { maxLeverage: 2.7, lpName: 'OSMO-ATOM' },
    ltv: {
      max: 0.625,
      contract: 0.63,
      liq: 0.65,
    },
    apy: 0,
  },
  {
    address: 'osmo1jfmwayj8jqp9tfy4v4eks5c2jpnqdumn8x8xvfllng0wfes770qqp7jl4j',
    name: { name: 'OSMO-USDC.axl LP', unlockDuration: 14, unlockTimeframe: 'days' },
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
      lpToken: 'gamm/pool/678',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'USDC.axl',
    },
    color: '#478edc',
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description: { maxLeverage: 2.86, lpName: 'OSMO-USDC.axl' },
    ltv: {
      max: 0.645,
      contract: 0.65,
      liq: 0.66,
    },
    apy: 0,
  },
  {
    address: 'osmo1a6tcf60pyz8qq2n532dzcs7s7sj8klcmra04tvaqympzcvxqg9esn7xz7l',
    name: { name: 'stATOM-ATOM', unlockDuration: 14, unlockTimeframe: 'days' },
    denoms: {
      primary: 'ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901',
      secondary: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
      lpToken: 'gamm/pool/803',
    },
    symbols: {
      primary: 'stATOM',
      secondary: 'ATOM',
    },
    color: '#a446db',
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description: { maxLeverage: 2.56, lpName: 'stATOM-ATOM' },
    ltv: {
      max: 0.6,
      contract: 0.61,
      liq: 0.625,
    },
    apy: 0,
  },
]
