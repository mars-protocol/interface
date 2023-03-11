import { ChainInfoID, WalletID } from '@marsprotocol/wallet-connector'
import { URL_GQL, URL_REST, URL_RPC } from 'constants/env'
import atom from 'images/atom.svg'
import axlusdc from 'images/axlusdc.svg'
import mars from 'images/mars.svg'
import osmo from 'images/osmo.svg'
import colors from 'styles/_assets.module.scss'

export const ASSETS: { [denom: string]: Asset } = {
  osmo: {
    symbol: 'OSMO',
    name: 'Osmosis',
    denom: 'uosmo',
    color: colors.osmo,
    decimals: 6,
    hasOraclePrice: true,
    logo: osmo,
  },
  axlusdc: {
    symbol: 'axlUSDC',
    name: 'Axelar USDC',
    denom: 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
    color: colors.axlUSDC,
    logo: axlusdc,
    decimals: 6,
    hasOraclePrice: true,
    poolId: 678,
  },
  atom: {
    symbol: 'ATOM',
    name: 'Atom',
    denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    color: colors.atom,
    logo: atom,
    decimals: 6,
    hasOraclePrice: true,
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
    hasOraclePrice: true,
    poolId: 907,
  },
}

export const NETWORK_CONFIG: NetworkConfig = {
  name: ChainInfoID.Osmosis1,
  hiveUrl:
    URL_GQL ?? 'https://osmosis-node.marsprotocol.io/GGSFGSFGFG34/osmosis-hive-front/graphql',
  rpcUrl: URL_RPC ?? 'https://rpc-osmosis.blockapsis.com/',
  restUrl: URL_REST ?? 'https://lcd-osmosis.blockapsis.com/',
  apolloAprUrl: 'https://api.apollo.farm/api/vault_infos/v2/osmosis-1',
  contracts: {
    redBank: 'osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg',
    incentives: 'osmo1nkahswfr8shg8rlxqwup0vgahp0dk4x8w6tkv3rra8rratnut36sk22vrm',
    oracle: 'osmo1mhznfr60vjdp2gejhyv2gax9nvyyzhd3z0qcwseyetkfustjauzqycsy2g',
    creditManager: 'osmo1f2m24wktq0sw3c0lexlg7fv4kngwyttvzws3a3r3al9ld2s2pvds87jqvf',
    accountNft: 'osmo1450hrg6dv2l58c0rvdwx8ec2a0r6dd50hn4frk370tpvqjhy8khqw7sw09',
  },
  assets: {
    base: ASSETS.osmo,
    whitelist: [ASSETS.osmo, ASSETS.atom, ASSETS.axlusdc],
    other: [OTHER_ASSETS.mars],
  },
  displayCurrency: {
    denom: 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
    prefix: '',
    suffix: 'axlUSDC',
    decimals: 2,
  },
  appUrl: 'https://app.osmosis.zone',
  wallets: [
    WalletID.Keplr,
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
    name: 'OSMO-ATOM LP (14 day)',
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
    description:
      'Up to 2.67× leveraged yield farming with auto compounding of the OSMO-ATOM LP tokens.',
    ltv: {
      max: 0.625,
      contract: 0.63,
      liq: 0.65,
    },
    apy: 0,
  },
  {
    address: 'osmo1jfmwayj8jqp9tfy4v4eks5c2jpnqdumn8x8xvfllng0wfes770qqp7jl4j',
    name: 'OSMO-axlUSDC LP (14 day)',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
      lpToken: 'gamm/pool/678',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'axlUSDC',
    },
    color: '#478edc',
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description:
      'Up to 2.78× leveraged yield farming with auto compounding of the OSMO-axlUSDC LP tokens.',
    ltv: {
      max: 0.64,
      contract: 0.65,
      liq: 0.66,
    },
    apy: 0,
  },
]
