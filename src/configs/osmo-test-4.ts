import { ChainInfoID, WalletID } from '@marsprotocol/wallet-connector'
import { URL_GQL, URL_REST, URL_RPC } from 'constants/env'
import atom from 'images/atom.svg'
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
  },
  juno: {
    symbol: 'JUNO',
    name: 'Juno',
    denom: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
    color: colors.juno,
    logo: juno,
    decimals: 6,
    poolId: 497,
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
    poolId: 768,
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
  name: ChainInfoID.OsmosisTestnet,
  hiveUrl:
    URL_GQL ??
    'https://testnet-osmosis-node.marsprotocol.io/XF32UOOU55CX/osmosis-hive-front/graphql',
  rpcUrl: URL_RPC ?? 'https://rpc-test.osmosis.zone/',
  restUrl: URL_REST ?? 'https://lcd-test.osmosis.zone/',
  apolloAprUrl: 'https://api.apollo.farm/api/vault_infos/v2/osmo-test-4',
  osmoUsdPriceUrl: 'https://api-osmosis.imperator.co/tokens/v2/OSMO',
  contracts: {
    redBank: 'osmo1e9awnhgz8v2vmyx2yrquudfsany687mtn8zdyn255fn7k982h8wqm4t3gp',
    incentives: 'osmo1cmuykglf6juftw0w97xgtg7808e27w7mgg63f5pvdncwecd7zmssgtltsj',
    oracle: 'osmo1szpxhxnsy0lk2qs4lh6jnz5yqzn0huw037qp0qtypkfgc9k988js6wj9ge',
    creditManager: 'osmo13pyg20kk48jad38x2cl7uejryjnyk03j9npgcm0ttvl55xyuar8sr6xlst',
    accountNft: 'osmo1k8wmkpveumhzj2sp7kedhn39zm9f6726laqwflxjf4wygzgvzj0qnhjaef',
  },
  assets: {
    base: ASSETS.osmo,
    whitelist: [ASSETS.osmo, ASSETS.atom, ASSETS.juno],
    other: [OTHER_ASSETS.usd, OTHER_ASSETS.mars],
    currencies: [OTHER_ASSETS.usd, ASSETS.osmo, ASSETS.atom, ASSETS.juno, OTHER_ASSETS.mars],
  },
  displayCurrency: OTHER_ASSETS.usd,
  appUrl: 'https://testnet.osmosis.zone',
  wallets: [WalletID.Keplr, WalletID.Leap, WalletID.Cosmostation],
}

export const VAULT_CONFIGS: Vault[] = [
  {
    address: 'osmo1tp2m6g39h8mvhnu3plqjyen5s63023gj8w873l8wvly0cd77l6hsaa73wt',
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
    color: '#DD5B65',
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description: { maxLeverage: 1.43, lpName: 'OSMO-ATOM' },
    ltv: {
      max: 0.295,
      contract: 0.3,
      liq: 0.4,
    },
    apy: 0,
  },
  {
    address: 'osmo1r6h0pafu3wq0kf6yv09qhc8qvuku2d6fua0rpwwv46h7hd8u586scxspjf',
    name: { name: 'OSMO-JUNO LP', unlockDuration: 1, unlockTimeframe: 'days' },
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
    description: { maxLeverage: 1.43, lpName: 'OSMO-JUNO' },
    ltv: {
      max: 0.295,
      contract: 0.3,
      liq: 0.4,
    },
    apy: 0,
  },
  {
    address: 'osmo1d6knwkelyr9eklewnn9htkess4ttpxpf2cze9ec0xfw7e3fj0ggssqzfpp',
    name: { name: 'OSMO-JUNO LP', unlockDuration: 14, unlockTimeframe: 'days' },
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
    description: { maxLeverage: 1.43, lpName: 'OSMO-JUNO' },
    ltv: {
      max: 0.295,
      contract: 0.3,
      liq: 0.4,
    },
    apy: 0,
  },
]
