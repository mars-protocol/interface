import {
  CosmostationExtensionProvider,
  CosmostationMobileProvider,
  KeplrExtensionProvider,
  KeplrMobileProvider,
  LeapCosmosExtensionProvider,
  LeapCosmosMobileProvider,
  LeapMetamaskCosmosSnapExtensionProvider,
  ShuttleProvider,
  StationExtensionProvider,
  VectisCosmosExtensionProvider,
  WalletExtensionProvider,
  WalletMobileProvider,
  XDEFICosmosExtensionProvider,
} from '@delphi-labs/shuttle-react'
import { CHAINS } from 'constants/chains'
import { WALLETS } from 'constants/wallets'
import { FC } from 'react'
import { ChainInfoID, WalletID } from 'types/enums/wallet'

type Props = {
  children?: React.ReactNode
}

function getSupportedChainsInfos(walletId: WalletID) {
  return WALLETS[walletId].supportedChains.map((chain) => {
    const chainInfo: ChainInfo = CHAINS[chain]

    switch (chainInfo.chainId) {
      case ChainInfoID.Osmosis1:
        chainInfo.rpc = process.env.NEXT_PUBLIC_OSMOSIS_RPC ?? chainInfo.rpc
        chainInfo.rest = process.env.NEXT_PUBLIC_OSMOSIS_REST ?? chainInfo.rpc
        break

      case ChainInfoID.Neutron1:
        chainInfo.rpc = process.env.NEXT_PUBLIC_NEUTRON_RPC ?? chainInfo.rpc
        chainInfo.rest = process.env.NEXT_PUBLIC_NEUTRON_REST ?? chainInfo.rpc
        break

      case ChainInfoID.NeutronTestnet:
        chainInfo.rpc = process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? chainInfo.rpc
        chainInfo.rest = process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? chainInfo.rpc
        break
    }

    return chainInfo
  })
}

const mobileProviders: WalletMobileProvider[] = [
  new KeplrMobileProvider({
    networks: getSupportedChainsInfos(WalletID.KeplrMobile),
  }),
  new LeapCosmosMobileProvider({
    networks: getSupportedChainsInfos(WalletID.LeapMobile),
  }),
  new CosmostationMobileProvider({
    networks: getSupportedChainsInfos(WalletID.CosmostationMobile),
  }),
]

const extensionProviders: WalletExtensionProvider[] = [
  new KeplrExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Keplr) }),
  new LeapCosmosExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Leap) }),
  new LeapMetamaskCosmosSnapExtensionProvider({
    networks: getSupportedChainsInfos(WalletID.LeapSnap),
  }),
  new CosmostationExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Cosmostation) }),
  new XDEFICosmosExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Xdefi) }),
  new StationExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Station) }),
  new VectisCosmosExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Vectis) }),
]

export const WalletConnectProvider: FC<Props> = ({ children }) => {
  return (
    <ShuttleProvider
      walletConnectProjectId={
        process.env.NEXT_PUBLIC_WALLET_CONNECT_ID ?? '0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x'
      }
      mobileProviders={mobileProviders}
      extensionProviders={extensionProviders}
      persistent
    >
      {children}
    </ShuttleProvider>
  )
}
