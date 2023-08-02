import { ChainInfoID } from '@marsprotocol/wallet-connector'
import atom from 'images/atom.svg'
import axl from 'images/axl.svg'
import axlusdc from 'images/axlusdc.svg'
import mars from 'images/mars.svg'
import osmo from 'images/osmo.svg'
import colors from 'styles/_assets.module.scss'

const ASSETS: NetworkAssets = {
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
  atom: {
    symbol: 'ATOM',
    name: 'Atom',
    id: 'ATOM',
    denom: 'ibc/A8C2D23A1E6F95DA4E48BA349667E322BD7A6C996D8A4AAE8BA72E190F3D1477',
    color: colors.atom,
    logo: atom,
    decimals: 6,
    priceFeedId: 'b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
  },
  axl: {
    symbol: 'AXL',
    name: 'Axelar',
    id: 'AXL',
    denom: 'ibc/4DAE26570FD24ABA40E2BE4137E39D946C78B00B248D3F78B0919567C4371156',
    color: colors.axl,
    logo: axl,
    decimals: 6,
    priceFeedId: '60144b1d5c9e9851732ad1d9760e3485ef80be39b984f6bf60f82b28a2b7f126',
  },
  axlusdc: {
    symbol: 'USDC.axl',
    name: 'Axelar USDC',
    id: 'axlUSDC',
    denom: 'ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE',
    color: colors.usdc,
    decimals: 6,
    logo: axlusdc,
    priceFeedId: 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  },
}

const OTHER_ASSETS: { [denom: string]: OtherAsset } = {
  mars: {
    symbol: 'MARS',
    name: 'Mars',
    id: 'MARS',
    denom: 'ibc/2E7368A14AC9AB7870F32CFEA687551C5064FA861868EDF7437BC877358A81F9',
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
  name: ChainInfoID.OsmosisTestnet,
  displayName: 'Osmosis Testnet',
  hiveUrl:
    process.env.NEXT_PUBLIC_OSMOSIS_TEST_GQL ??
    'https://testnet-osmosis-node.marsprotocol.io/XF32UOOU55CX/osmosis-hive-front/graphql',
  rpcUrl: process.env.NEXT_PUBLIC_OSMOSIS_TEST_RPC ?? 'https://rpc.osmotest5.osmosis.zone/',
  restUrl: process.env.NEXT_PUBLIC_OSMOSIS_TEST_REST ?? 'https://lcd.osmotest5.osmosis.zone/',
  apolloAprUrl: 'https://api.apollo.farm/api/vault_infos/v2/osmo-test-5',
  usdPriceUrl: 'https://xc-mainnet.pyth.network/api/',
  chainIcon: osmo,
  contracts: {
    redBank: 'osmo1dl4rylasnd7mtfzlkdqn2gr0ss4gvyykpvr6d7t5ylzf6z535n9s5jjt8u',
    incentives: 'osmo1zyz57xf82963mcsgqu3hq5y0h9mrltm4ttq2qe5mjth9ezp3375qe0sm7d',
    oracle: 'osmo1khe29uw3t85nmmp3mtr8dls7v2qwsfk3tndu5h4w5g2r5tzlz5qqarq2e2',
    creditManager: 'osmo15ywk53ck3wp6tnqgedfd8cnfx7fuhz9dr583hw8scp0xjgw46m0sf3kyyp',
    accountNft: 'osmo1ye2rntzz9qmxgv7eg09supww6k6xs0y0sekcr3x5clp087fymn4q3y33s4',
    pyth: 'osmo12u2vqdecdte84kg6c3d40nwzjsya59hsj048n687m9q3t6wdmqgsq6zrlx',
  },
  assets: {
    base: ASSETS.osmo,
    whitelist: [ASSETS.osmo, ASSETS.atom, ASSETS.axl, ASSETS.axlusdc],
    other: [OTHER_ASSETS.usd, OTHER_ASSETS.mars],
    currencies: [
      OTHER_ASSETS.usd,
      ASSETS.osmo,
      ASSETS.atom,
      ASSETS.axl,
      ASSETS.axlusdc,
      OTHER_ASSETS.mars,
    ],
  },
  displayCurrency: OTHER_ASSETS.usd,
  appUrl: 'https://testnet.osmosis.zone',
  isFieldsEnabled: true,
}

export const VAULT_CONFIGS: Vault[] = [
  {
    address: 'osmo1m45ap4rq4m2mfjkcqu9ks9mxmyx2hvx0cdca9sjmrg46q7lghzqqhxxup5',
    name: { name: 'OSMO-ATOM LP', unlockDuration: 1, unlockTimeframe: 'day' },
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/A8C2D23A1E6F95DA4E48BA349667E322BD7A6C996D8A4AAE8BA72E190F3D1477',
      lpToken: 'gamm/pool/12',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'ATOM',
    },
    color: colors.usdc,
    lockup: 86400 * 1,
    provider: 'Apollo vault',
    description: { maxLeverage: 1.43, lpName: 'OSMO-ATOM' },
    ltv: {
      max: 0.295,
      contract: 0.3,
      liq: 0.4,
    },
    apy: {
      apys: null,
      fees: null,
      total: null,
      vaultAddress: '',
    },
  },
  {
    address: 'osmo14lu7m4ganxs20258dazafrjfaulmfxruq9n0r0th90gs46jk3tuqwfkqwn',
    name: { name: 'OSMO-USDC.axl LP', unlockDuration: 7, unlockTimeframe: 'days' },
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE',
      lpToken: 'gamm/pool/5',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'USDC.axl',
    },
    color: colors.usdc,
    lockup: 86400 * 7,
    provider: 'Apollo vault',
    description: { maxLeverage: 1.43, lpName: 'OSMO-USDC.axl' },
    ltv: {
      max: 0.295,
      contract: 0.3,
      liq: 0.4,
    },
    apy: {
      apys: null,
      fees: null,
      total: null,
      vaultAddress: '',
    },
  },
]
