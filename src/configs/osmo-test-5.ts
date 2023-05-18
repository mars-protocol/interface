import { ChainInfoID, WalletID } from '@marsprotocol/wallet-connector'
import { URL_GQL, URL_REST, URL_RPC } from 'constants/env'
import atom from 'images/atom.svg'
import axl from 'images/axl.svg'
import axlusdc from 'images/axlusdc.svg'
import mars from 'images/mars.svg'
import nusdc from 'images/nusdc.svg'
import osmo from 'images/osmo.svg'
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
  atom: {
    symbol: 'ATOM',
    name: 'Atom',
    id: 'ATOM',
    denom: 'ibc/A8C2D23A1E6F95DA4E48BA349667E322BD7A6C996D8A4AAE8BA72E190F3D1477',
    color: colors.atom,
    logo: atom,
    decimals: 6,
  },
  axl: {
    symbol: 'AXL',
    name: 'Axelar',
    id: 'AXL',
    denom: 'ibc/4DAE26570FD24ABA40E2BE4137E39D946C78B00B248D3F78B0919567C4371156',
    color: colors.axl,
    logo: axl,
    decimals: 6,
  },
  axlusdc: {
    symbol: 'USDC.axl',
    name: 'Axelar USDC',
    id: 'axlUSDC',
    denom: 'ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE',
    color: colors.usdc,
    decimals: 6,
    logo: axlusdc,
  },
  nusdc: {
    symbol: 'USDC.n',
    name: 'Noble USDC',
    id: 'nUSDC',
    denom: 'ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4',
    color: colors.usdc,
    decimals: 6,
    logo: nusdc,
  },
}

const OTHER_ASSETS: { [denom: string]: OtherAsset } = {
  mars: {
    symbol: 'MARS',
    name: 'Mars',
    denom: 'ibc/DB9D326CF53EA07610C394D714D78F8BB4DC7E312D4213193791A9046BF45E20',
    color: colors.mars,
    logo: mars,
    decimals: 6,
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
  name: ChainInfoID.OsmosisTestnet5,
  hiveUrl:
    URL_GQL ??
    'https://testnet-osmosis-node.marsprotocol.io/XF32UOOU55CX/osmosis-hive-front/graphql',
  rpcUrl: URL_RPC ?? 'https://rpc.osmotest5.osmosis.zone/',
  restUrl: URL_REST ?? 'https://lcd.osmotest5.osmosis.zone/',
  apolloAprUrl: 'https://api.apollo.farm/api/vault_infos/v2/osmo-test-5',
  osmoUsdPriceUrl: 'https://api-osmosis.imperator.co/tokens/v2/OSMO',
  contracts: {
    redBank: 'osmo1dl4rylasnd7mtfzlkdqn2gr0ss4gvyykpvr6d7t5ylzf6z535n9s5jjt8u',
    incentives: 'osmo1zyz57xf82963mcsgqu3hq5y0h9mrltm4ttq2qe5mjth9ezp3375qe0sm7d',
    oracle: 'osmo1khe29uw3t85nmmp3mtr8dls7v2qwsfk3tndu5h4w5g2r5tzlz5qqarq2e2',
    creditManager: 'osmo15ywk53ck3wp6tnqgedfd8cnfx7fuhz9dr583hw8scp0xjgw46m0sf3kyyp',
    accountNft: 'osmo1ye2rntzz9qmxgv7eg09supww6k6xs0y0sekcr3x5clp087fymn4q3y33s4',
  },
  assets: {
    base: ASSETS.osmo,
    whitelist: [ASSETS.osmo, ASSETS.atom, ASSETS.axl, ASSETS.axlusdc, ASSETS.nusdc],
    other: [OTHER_ASSETS.usd, OTHER_ASSETS.mars],
    currencies: [
      OTHER_ASSETS.usd,
      ASSETS.osmo,
      ASSETS.atom,
      ASSETS.axl,
      ASSETS.axlusdc,
      ASSETS.nusdc,
      OTHER_ASSETS.mars,
    ],
  },
  displayCurrency: OTHER_ASSETS.usd,
  appUrl: 'https://testnet.osmosis.zone',
  wallets: [WalletID.Keplr, WalletID.Leap, WalletID.Cosmostation],
}

export const VAULT_CONFIGS: Vault[] = [
  {
    address: 'osmo1q40xvrzpldwq5he4ftsf7zm2jf80tj373qaven38yqrvhex8r9rs8n94kv',
    name: { name: 'OSMO-USDC.n LP', unlockDuration: 1, unlockTimeframe: 'day' },
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4',
      lpToken: 'gamm/pool/6',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'USDC.n',
    },
    color: colors.usdc,
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description: { maxLeverage: 1.43, lpName: 'OSMO-USDC.n' },
    ltv: {
      max: 0.295,
      contract: 0.3,
      liq: 0.4,
    },
    apy: 0,
  },
  {
    address: 'osmo14lu7m4ganxs20258dazafrjfaulmfxruq9n0r0th90gs46jk3tuqwfkqwn',
    name: { name: 'OSMO-USDC.n LP', unlockDuration: 7, unlockTimeframe: 'days' },
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4',
      lpToken: 'gamm/pool/6',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'USDC.n',
    },
    color: colors.usdc,
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description: { maxLeverage: 1.43, lpName: 'OSMO-USDC.n' },
    ltv: {
      max: 0.295,
      contract: 0.3,
      liq: 0.4,
    },
    apy: 0,
  },
  {
    address: 'osmo1fmq9hw224fgz8lk48wyd0gfg028kvvzggt6c3zvnaqkw23x68cws5nd5em',
    name: { name: 'OSMO-USDC.n LP', unlockDuration: 14, unlockTimeframe: 'days' },
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4',
      lpToken: 'gamm/pool/6',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'USDC.n',
    },
    color: colors.usdc,
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description: { maxLeverage: 1.43, lpName: 'OSMO-USDC.n' },
    ltv: {
      max: 0.295,
      contract: 0.3,
      liq: 0.4,
    },
    apy: 0,
  },
]
