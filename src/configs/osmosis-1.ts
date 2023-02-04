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
    symbol: 'JUNO',
    name: 'Juno',
    denom: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
    color: colors.juno,
    logo: axlusdc,
    decimals: 6,
    hasOraclePrice: true,
  },
}

const OTHER_ASSETS: { [denom: string]: OtherAsset } = {
  mars: {
    symbol: 'MARS',
    name: 'Mars',
    denom: 'ibc/ACA4C8A815A053CC027DB90D15915ADA31939FA331CE745862CDD00A2904FA17',
    color: colors.mars,
    logo: mars,
    decimals: 6,
    hasOraclePrice: true,
    poolId: 768,
  },
}

export const NETWORK_CONFIG: NetworkConfig = {
  name: ChainInfoID.OsmosisTestnet,
  hiveUrl: 'https://osmosis-delphi-testnet-1.simply-vc.com.mt/XF32UOOU55CX/osmosis-hive/graphql/',
  rpcUrl: 'https://osmosis-delphi-testnet-1.simply-vc.com.mt/XF32UOOU55CX/osmosis-rpc/',
  restUrl: 'https://osmosis-delphi-testnet-1.simply-vc.com.mt/XF32UOOU55CX/osmosis-lcd/',
  apolloAprUrl: 'https://stats.apollo.farm/api/apr/v1/all',
  contracts: {
    addressProvider: 'osmo17dyy6hyzzy6u5khy5lau7afa2y9kwknu0aprwqn8twndw2qhv8ls6msnjr',
    redBank: 'osmo1t0dl6r27phqetfu0geaxrng0u9zn8qgrdwztapt5xr32adtwptaq6vwg36',
    incentives: 'osmo1zxs8fry3m8j94pqg7h4muunyx86en27cl0xgk76fc839xg2qnn6qtpjs48',
    oracle: 'osmo1dqz2u3c8rs5e7w5fnchsr2mpzzsxew69wtdy0aq4jsd76w7upmsstqe0s8',
    rewardsCollector: 'osmo14kzsqw5tatdvwlkj383lgkh6gcdetwn7kfqm7488uargyy2lpucqsyv53j',
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
  appUrl: 'https://testnet.osmosis.zone',
  councilUrl: 'https://council.marsprotocol.io',
  wallets: [WalletID.Keplr, WalletID.Leap, WalletID.Cosmostation, WalletID.Falcon],
}

export const VAULT_CONFIGS: Vault[] = [
  {
    address: '',
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
    color: '#DD5B65',
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description: 'Up to 2× Leveraged Yield Farming with auto compounding of the LP tokens.',
    ltv: {
      max: 0.625,
      contract: 0.63,
      liq: 0.65,
    },
  },
  {
    address: '',
    name: 'OSMO-axlUSDC LP (14 day)',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
      lpToken: 'gamm/pool/1',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'ATOM',
    },
    color: '#DD5B65',
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description: 'Up to 2× Leveraged Yield Farming with auto compounding of the LP tokens.',
    ltv: {
      max: 0.666,
      contract: 0.67,
      liq: 0.69,
    },
  },
]
