import { ChainInfoID, WalletID } from 'types/enums/wallet'

export const WALLETS: WalletInfos = {
  [WalletID.Cosmostation]: {
    name: 'Cosmostation Wallet',
    install: 'Install Cosmostation Wallet',
    installURL:
      'https://chrome.google.com/webstore/detail/cosmostation-wallet/fpkhgmpbidmiogeglndfbkegfdlnajnf',
    description: 'Cosmostation Extension',
    imageURL: '/images/wallets/cosmostation.png',
    supportedChains: [
      ChainInfoID.Osmosis1,
      ChainInfoID.OsmosisDevnet,
      ChainInfoID.Neutron1,
      ChainInfoID.NeutronTestnet,
    ],
  },
  [WalletID.CosmostationMobile]: {
    name: 'Cosmostation Wallet',
    walletConnect: 'Cosmostation WalletConnect',
    imageURL: '/images/wallets/cosmostation.png',
    description: 'Cosmostation Mobile App',
    mobileImageURL: '/images/wallets/cosmostation-wc.png',
    supportedChains: [
      ChainInfoID.Osmosis1,
      ChainInfoID.OsmosisDevnet,
      ChainInfoID.Neutron1,
      ChainInfoID.NeutronTestnet,
    ],
  },
  [WalletID.Keplr]: {
    name: 'Keplr Wallet',
    install: 'Install Keplr Wallet',
    installURL: 'https://www.keplr.app/download',
    description: 'Keplr Extension',
    imageURL: '/images/wallets/keplr.png',
    supportedChains: [
      ChainInfoID.Osmosis1,
      ChainInfoID.OsmosisDevnet,
      ChainInfoID.Neutron1,
      ChainInfoID.NeutronTestnet,
    ],
  },
  [WalletID.KeplrMobile]: {
    name: 'Keplr Wallet',
    walletConnect: 'Keplr WalletConnect',
    imageURL: '/images/wallets/keplr.png',
    description: 'Keplr Mobile App',
    mobileImageURL: '/images/wallets/keplr-wc.png',
    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.Neutron1],
  },
  [WalletID.Leap]: {
    name: 'Leap Wallet',
    install: 'Install Leap Wallet',
    installURL:
      'https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg',
    description: 'Leap Extension',
    imageURL: '/images/wallets/leap-cosmos.png',
    supportedChains: [
      ChainInfoID.Osmosis1,
      ChainInfoID.OsmosisDevnet,
      ChainInfoID.Neutron1,
      ChainInfoID.NeutronTestnet,
    ],
  },
  [WalletID.LeapMobile]: {
    name: 'Leap Wallet',
    walletConnect: 'Leap WalletConnect',
    imageURL: '/images/wallets/leap-cosmos.png',
    description: 'Leap Mobile App',
    mobileImageURL: '/images/wallets/leap-wc.png',
    supportedChains: [
      ChainInfoID.Osmosis1,
      ChainInfoID.OsmosisDevnet,
      ChainInfoID.Neutron1,
      ChainInfoID.NeutronTestnet,
    ],
  },
  [WalletID.LeapSnap]: {
    name: 'MetaMask (via Leap Snap)',
    install: 'Install MetaMask',
    installURL: 'https://metamask.io/download/',
    description: 'MetaMask Snap provided by Leap',
    imageURL: '/images/wallets/leap-metamask-snap.png',
    supportedChains: [
      ChainInfoID.Osmosis1,
      ChainInfoID.OsmosisDevnet,
      ChainInfoID.Neutron1,
      ChainInfoID.NeutronTestnet,
    ],
  },
  [WalletID.Station]: {
    name: 'Station Wallet',
    install: 'Install Station Wallet',
    installURL:
      'https://chrome.google.com/webstore/detail/station-wallet/aiifbnbfobpmeekipheeijimdpnlpgpp',
    description: 'Station Wallet Extension',
    imageURL: '/images/wallets/station.png',
    supportedChains: [ChainInfoID.Osmosis1],
  },
  [WalletID.Xdefi]: {
    name: 'XDEFI Wallet',
    install: 'Install XDEFI Wallet',
    installURL: 'https://go.xdefi.io/mars',
    description: 'XDEFI Extension',
    imageURL: '/images/wallets/xdefi.png',
    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.Neutron1],
  },
  [WalletID.Vectis]: {
    name: 'Vectis Wallet',
    install: 'Install Vectis Wallet',
    installURL: 'https://chrome.google.com/webstore/detail/vectis/cgkaddoglojnmfiblgmlinfaijcdpfjm',
    description: 'Vectis Smart Contract Wallet',
    imageURL: '/images/wallets/vectis.png',
    supportedChains: [ChainInfoID.NeutronTestnet, ChainInfoID.Neutron1],
  },
}
