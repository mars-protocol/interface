import { ChainInfoID } from '@marsprotocol/wallet-connector'
import atom from 'images/atom.svg'
import axlusdc from 'images/axlusdc.svg'
import mars from 'images/mars.svg'
import ntrn from 'images/ntrn.svg'
import colors from 'styles/_assets.module.scss'

export const ASSETS: NetworkAssets = {
  ntrn: {
    symbol: 'NTRN',
    name: 'Neutron',
    id: 'NTRN',
    denom: 'untrn',
    color: colors.ntrn,
    logo: ntrn,
    decimals: 6,
  },
  atom: {
    symbol: 'ATOM',
    name: 'Atom',
    id: 'ATOM',
    denom: 'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9',
    color: colors.atom,
    logo: atom,
    decimals: 6,
  },
  axlusdc: {
    symbol: 'USDC.axl',
    name: 'Axelar USDC',
    id: 'axlUSDC',
    denom: 'ibc/EFB00E728F98F0C4BBE8CA362123ACAB466EDA2826DC6837E49F4C1902F21BBA',
    color: colors.usdc,
    decimals: 6,
    logo: axlusdc,
  },
}

const OTHER_ASSETS: { [denom: string]: OtherAsset } = {
  mars: {
    symbol: 'MARS',
    id: 'MARS',
    name: 'Mars',
    denom: 'ibc/FAD9EE91F499D275D9135F95F52D59D90C621B8438A9CFF1757BB886EEE90E3E',
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
  name: ChainInfoID.NeutronTestnet,
  displayName: 'Neutron Testnet',
  hiveUrl:
    process.env.NEXT_PUBLIC_NEUTRON_TEST_GQL ??
    'https://testnet-neutron-gql.marsprotocol.io/graphql',
  rpcUrl: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech/',
  restUrl: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech/',
  chainIcon: ntrn,
  contracts: {
    redBank: 'neutron15dld0kmz0zl89zt4yeks4gy8mhmawy3gp4x5rwkcgkj5krqvu9qs4q7wve',
    incentives: 'neutron1t8fectc2ntxhuee2f9ty2mxh8l0ykzm6yxfsp9k35vdktksm2vfsd2d6rl',
    oracle: 'neutron1nx9txtmpmkt58gxka20z72wdkguw4n0606zkeqvelv7q7uc06zmsym3qgx',
  },
  assets: {
    base: ASSETS.ntrn,
    whitelist: [ASSETS.ntrn, ASSETS.atom, ASSETS.axlusdc],
    other: [OTHER_ASSETS.usd, OTHER_ASSETS.mars],
    currencies: [OTHER_ASSETS.usd, ASSETS.ntrn, ASSETS.atom, ASSETS.axlusdc, OTHER_ASSETS.mars],
  },
  displayCurrency: OTHER_ASSETS.usd,
  appUrl: 'https://app.astroport.fi/swap',
  isFieldsEnabled: false,
}

export const VAULT_CONFIGS: Vault[] = []
