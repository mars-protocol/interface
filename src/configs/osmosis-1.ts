import atom from 'images/atom.svg'
import axl from 'images/axl.svg'
import axlusdc from 'images/axlusdc.svg'
import axlwbtc from 'images/axlwbtc.svg'
import axlweth from 'images/axlweth.svg'
import inj from 'images/inj.svg'
import mars from 'images/mars.svg'
import osmo from 'images/osmo.svg'
import statom from 'images/statom.svg'
import stosmo from 'images/stosmo.svg'
import tia from 'images/tia.svg'
import usdc from 'images/usdc.svg'
import usdt from 'images/usdt.svg'
import colors from 'styles/_assets.module.scss'
import { ChainInfoID } from 'types/enums/wallet'

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
  axlusdc: {
    symbol: 'USDC.axl',
    name: 'Axelar USDC',
    id: 'axlUSDC',
    denom: 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
    color: colors.usdc,
    decimals: 6,
    logo: axlusdc,
    priceFeedId: 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  },
  axlwbtc: {
    symbol: 'WBTC.axl',
    id: 'axlWBTC',
    name: 'Axelar Wrapped Bitcoin',
    denom: 'ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F',
    color: colors.wbtc,
    logo: axlwbtc,
    decimals: 8,
    priceFeedId: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  },
  axlweth: {
    symbol: 'WETH.axl',
    id: 'axlWETH',
    name: 'Axelar Wrapped Ethereum',
    denom: 'ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5',
    color: colors.weth,
    logo: axlweth,
    decimals: 18,
    priceFeedId: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  },
  atom: {
    symbol: 'ATOM',
    name: 'Atom',
    id: 'ATOM',
    denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    color: colors.atom,
    logo: atom,
    decimals: 6,
    priceFeedId: 'b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
  },
  axl: {
    symbol: 'AXL',
    name: 'Axelar',
    id: 'AXL',
    denom: 'ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E',
    color: colors.axl,
    logo: axl,
    decimals: 6,
    priceFeedId: '60144b1d5c9e9851732ad1d9760e3485ef80be39b984f6bf60f82b28a2b7f126',
  },
  statom: {
    symbol: 'stATOM',
    name: 'Stride Atom',
    id: 'stATOM',
    denom: 'ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901',
    color: colors.statom,
    logo: statom,
    decimals: 6,
  },
  usdc: {
    symbol: 'USDC',
    name: 'Noble',
    id: 'USDC',
    denom: 'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4',
    color: colors.usdc,
    decimals: 6,
    logo: usdc,
    priceFeedId: 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  },
  usdt: {
    symbol: 'USDT',
    id: 'USDT',
    name: 'Tether',
    denom: 'ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB',
    color: colors.usdt,
    decimals: 6,
    logo: usdt,
    priceFeedId: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
  },
  tia: {
    symbol: 'TIA',
    id: 'TIA',
    name: 'Celestia',
    denom: 'ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877',
    logo: tia,
    color: colors.tia,
    decimals: 6,
    priceFeedId: '09f7c1d7dfbb7df2b8fe3d3d87ee94a2259d212da4f30c1f0540d066dfa44723',
  },
  inj: {
    symbol: 'INJ',
    id: 'INJ',
    name: 'Injective',
    denom: 'ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273',
    logo: inj,
    color: colors.inj,
    decimals: 18,
    priceFeedId: '0x7a5bc1d2b56ad029048cd63964b3ad2776eadf812edc1a43a31406cb54bff592',
  },
  stosmo: {
    symbol: 'stOSMO',
    id: 'stOSMO',
    name: 'Stride Osmosis',
    denom: 'ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC',
    color: colors.stosmo,
    logo: stosmo,
    decimals: 6,
  },
}

const OTHER_ASSETS: { [denom: string]: OtherAsset } = {
  mars: {
    symbol: 'MARS',
    name: 'Mars',
    id: 'MARS',
    denom: 'ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580',
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
  name: ChainInfoID.Osmosis1,
  displayName: 'Osmosis',
  hiveUrl:
    process.env.NEXT_PUBLIC_OSMOSIS_GQL ??
    'https://osmosis-node.marsprotocol.io/GGSFGSFGFG34/osmosis-hive-front/graphql/',
  rpcUrl: process.env.NEXT_PUBLIC_OSMOSIS_RPC ?? 'https://rpc-osmosis.blockapsis.com/',
  restUrl: process.env.NEXT_PUBLIC_OSMOSIS_REST ?? 'https://lcd-osmosis.blockapsis.com/',
  vaultAprUrl: 'https://api.marsprotocol.io/v1/vaults/osmosis',
  usdPriceUrl: 'https://hermes.pyth.network/api/',
  chainIcon: osmo,
  contracts: {
    redBank: 'osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg',
    incentives: 'osmo1nkahswfr8shg8rlxqwup0vgahp0dk4x8w6tkv3rra8rratnut36sk22vrm',
    oracle: 'osmo1mhznfr60vjdp2gejhyv2gax9nvyyzhd3z0qcwseyetkfustjauzqycsy2g',
    creditManager: 'osmo1f2m24wktq0sw3c0lexlg7fv4kngwyttvzws3a3r3al9ld2s2pvds87jqvf',
    accountNft: 'osmo1450hrg6dv2l58c0rvdwx8ec2a0r6dd50hn4frk370tpvqjhy8khqw7sw09',
    pyth: 'osmo13ge29x4e2s63a8ytz2px8gurtyznmue4a69n5275692v3qn3ks8q7cwck7',
    params: 'osmo1nlmdxt9ctql2jr47qd4fpgzg84cjswxyw6q99u4y4u4q6c2f5ksq7ysent',
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
      ASSETS.inj,
      ASSETS.statom,
      ASSETS.usdc,
      ASSETS.usdt,
      ASSETS.tia,
      ASSETS.stosmo,
    ],
    other: [OTHER_ASSETS.usd, OTHER_ASSETS.mars],
    currencies: [
      OTHER_ASSETS.usd,
      ASSETS.usdc,
      ASSETS.usdt,
      ASSETS.axlusdc,
      ASSETS.osmo,
      ASSETS.atom,
      ASSETS.axl,
      ASSETS.axlweth,
      ASSETS.axlwbtc,
      ASSETS.statom,
      ASSETS.stosmo,
      ASSETS.tia,
      OTHER_ASSETS.mars,
    ],
  },
  displayCurrency: OTHER_ASSETS.usd,
  appUrl: 'https://app.osmosis.zone',
  isFieldsEnabled: true,
  hasMultiAssetIncentives: true,
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
    description: { maxLeverage: 3.7, lpName: 'OSMO-ATOM' },
    ltv: {
      max: 0.725,
      contract: 0.73,
      liq: 0.75,
    },
    apy: {
      total: null,
      vaultAddress: '',
    },
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
    description: { maxLeverage: 4, lpName: 'OSMO-USDC.axl' },
    ltv: {
      max: 0.745,
      contract: 0.75,
      liq: 0.77,
    },
    apy: {
      total: null,
      vaultAddress: '',
    },
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
    description: { maxLeverage: 2.78, lpName: 'stATOM-ATOM' },
    ltv: {
      max: 0.635,
      contract: 0.64,
      liq: 0.65,
    },
    apy: {
      total: null,
      vaultAddress: '',
    },
  },
  {
    address: 'osmo185gqewrlde8vrqw7j8lpad67v8jfrx9u7770k9q87tqqecctp5tq50wt2c',
    name: { name: 'OSMO-WBTC.axl', unlockDuration: 14, unlockTimeframe: 'days' },
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F',
      lpToken: 'gamm/pool/712',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'WBTC.axl',
    },
    color: colors.wbtc,
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description: { maxLeverage: 4, lpName: 'OSMO-WBTC.axl' },
    ltv: {
      max: 0.745,
      contract: 0.75,
      liq: 0.77,
    },
    apy: {
      total: null,
      vaultAddress: '',
    },
  },
  {
    address: 'osmo1r235f4tdkwrsnj3mdm9hf647l754y6g6xsmz0nas5r4vr5tda3qsgtftef',
    name: { name: 'OSMO-WETH.axl', unlockDuration: 14, unlockTimeframe: 'days' },
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5',
      lpToken: 'gamm/pool/704',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'WETH.axl',
    },
    color: colors.weth,
    lockup: 86400 * 14,
    provider: 'Apollo vault',
    description: { maxLeverage: 4, lpName: 'OSMO-WETH.axl' },
    ltv: {
      max: 0.745,
      contract: 0.75,
      liq: 0.77,
    },
    apy: {
      total: null,
      vaultAddress: '',
    },
  },
]
