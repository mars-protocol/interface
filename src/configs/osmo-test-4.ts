import { ChainInfoID, WalletID } from '@marsprotocol/wallet-connector'
import { URL_GQL, URL_REST, URL_RPC } from 'constants/env'
import atom from 'images/atom.svg'
import axlusdc from 'images/axlusdc.svg'
import juno from 'images/juno.svg'
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
  juno: {
    symbol: 'JUNO',
    name: 'Juno',
    denom: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
    color: colors.juno,
    logo: juno,
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
  axlusdc: {
    symbol: 'axlUSDC',
    name: 'axlUSDC',
    // This is the address / pool of DAI, not USDC
    denom: 'ibc/88D70440A05BFB25C7FF0BA62DA357EAA993CB1B036077CF1DAAEFB28721D935',
    color: colors.axlusdc,
    logo: axlusdc,
    decimals: 6,
    hasOraclePrice: false,
    poolId: 674,
  },
}

export const NETWORK_CONFIG: NetworkConfig = {
  name: ChainInfoID.OsmosisTestnet,
  hiveUrl:
    URL_GQL ??
    'https://testnet-osmosis-node.marsprotocol.io/XF32UOOU55CX/osmosis-hive-front/graphql',
  rpcUrl: URL_RPC ?? 'https://rpc-test.osmosis.zone/',
  restUrl: URL_REST ?? 'https://lcd-test.osmosis.zone/',
  apolloAprUrl: 'https://api.apollo.farm/api/vault_infos/v2/osmo-test-4',
  contracts: {
    redBank: 'osmo1t0dl6r27phqetfu0geaxrng0u9zn8qgrdwztapt5xr32adtwptaq6vwg36',
    incentives: 'osmo1zxs8fry3m8j94pqg7h4muunyx86en27cl0xgk76fc839xg2qnn6qtpjs48',
    oracle: 'osmo1dqz2u3c8rs5e7w5fnchsr2mpzzsxew69wtdy0aq4jsd76w7upmsstqe0s8',
    creditManager: 'osmo1dzk4y3s9am6773sglhfc60nstz09c3gy978h2jka6wre5z4hlavq4pcwk0',
    accountNft: 'osmo16wwckvccarltl4mlnjhw3lcj3v59yglhldgw36ldkknmjavqyaasgcessw',
  },
  assets: {
    base: ASSETS.osmo,
    whitelist: [ASSETS.osmo, ASSETS.atom, ASSETS.juno],
    other: [OTHER_ASSETS.mars, OTHER_ASSETS.axlusdc],
  },
  displayCurrency: {
    denom: 'ibc/88D70440A05BFB25C7FF0BA62DA357EAA993CB1B036077CF1DAAEFB28721D935',
    prefix: '$',
    suffix: '',
    decimals: 2,
  },
  appUrl: 'https://testnet.osmosis.zone',
  wallets: [WalletID.Keplr, WalletID.Leap, WalletID.Cosmostation],
}

export const VAULT_CONFIGS: Vault[] = [
  {
    address: 'osmo1zktjv92f76epswjvyxzzt3yyskpw7k6jsyu0kmq4zzc5fphrjumqlahctp',
    name: 'OSMO-ATOM LP (1 day)',
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
    lockup: 86400,
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
    address: 'osmo1tp2m6g39h8mvhnu3plqjyen5s63023gj8w873l8wvly0cd77l6hsaa73wt',
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
    address: 'osmo1r6h0pafu3wq0kf6yv09qhc8qvuku2d6fua0rpwwv46h7hd8u586scxspjf',
    name: 'OSMO-JUNO LP (1 day)',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
      lpToken: 'gamm/pool/497',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'JUNO',
    },
    color: '#DD5B65',
    lockup: 86400 * 1,
    provider: 'Apollo vault',
    description:
      'Up to 1.67× leveraged yield farming with auto compounding of the OSMO-JUNO LP tokens.',
    ltv: {
      max: 0.4,
      contract: 0.4115,
      liq: 0.441,
    },
    apy: 0,
  },
  {
    address: 'osmo1d6knwkelyr9eklewnn9htkess4ttpxpf2cze9ec0xfw7e3fj0ggssqzfpp',
    name: 'OSMO-JUNO LP (14 day)',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
      lpToken: 'gamm/pool/497',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'JUNO',
    },
    color: '#DD5B65',
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description:
      'Up to 1.67× leveraged yield farming with auto compounding of the OSMO-JUNO LP tokens.',
    ltv: {
      max: 0.4,
      contract: 4.115,
      liq: 0.441,
    },
    apy: 0,
  },
]
