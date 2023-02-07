import { ChainInfoID, WalletID } from '@marsprotocol/wallet-connector'
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
  atom: {
    symbol: 'ATOM',
    name: 'Atom',
    denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    color: colors.atom,
    logo: atom,
    decimals: 6,
    hasOraclePrice: true,
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
  hiveUrl: 'https://osmosis-node.marsprotocol.io/GGSFGSFGFG34/osmosis-hive-front/graphql',
  rpcUrl: 'https://rpc-osmosis.blockapsis.com/',
  restUrl: 'https://lcd-osmosis.blockapsis.com/',
  apolloAprUrl: 'https://stats.apollo.farm/api/apr/v1/all',
  contracts: {
    addressProvider: 'osmo1g677w7mfvn78eeudzwylxzlyz69fsgumqrscj6tekhdvs8fye3asufmvxr',
    redBank: 'osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg',
    incentives: 'osmo1nkahswfr8shg8rlxqwup0vgahp0dk4x8w6tkv3rra8rratnut36sk22vrm',
    oracle: 'osmo1mhznfr60vjdp2gejhyv2gax9nvyyzhd3z0qcwseyetkfustjauzqycsy2g',
    rewardsCollector: 'osmo1urvqe5mw00ws25yqdd4c4hlh8kdyf567mpcml7cdve9w08z0ydcqvsrgdy',
    treasury: 'osmo1qv74pu0gjc9vuvkhayuj5j3q8fzmf4pnl643djqpv7enxr925g5q0wf7p3',
    safetyFund: 'osmo1j2mnzs7eqld4umtwky4hyf6f7kqcsg7ragh2l76ev7ucxcjvdjrs3tdezf',
    protocolRewardsCollector: 'osmo1xl7jguvkg807ya00s0l722nwcappfzyzrac3ug5tnjassnrmnfrs47wguz',
    creditManager: 'osmo1prwnxn3vlvh0kqmwxn8whqnavk8ze9hrccwpsapysgpa3pj8r2csy84grp',
    accountNft: 'osmo1ua5rw84jxg6e7ma4hx7v7yhqcks74cjnx38gpnsvtfzrtxhwcvjqgsxulx',
  },
  assets: {
    base: ASSETS.osmo,
    whitelist: [ASSETS.osmo, ASSETS.atom, ASSETS.axlusdc],
    other: [OTHER_ASSETS.mars],
  },
  displayCurrency: {
    denom: 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
    prefix: '$',
    suffix: '',
    decimals: 2,
  },
  appUrl: 'https://app.osmosis.zone',
  councilUrl: 'https://council.marsprotocol.io',
  wallets: [
    WalletID.Keplr,
    WalletID.Leap,
    WalletID.Cosmostation,
    WalletID.Falcon,
    WalletID.KeplrMobile,
  ],
}

export const VAULT_CONFIGS: Vault[] = []
