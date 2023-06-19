import { ChainInfoID, WalletID } from '@marsprotocol/wallet-connector'
import { SUPPORTED_CHAINS } from 'constants/appConstants'
import { DocURL } from 'types/enums/docURL'

export function getCouncilLink(currentNetwork: ChainInfoID, currentProvider?: WalletID): string {
  const isTestnet =
    SUPPORTED_CHAINS.find((chain) => chain.chainId === currentNetwork)?.type === 'testnet'

  if (isTestnet) return DocURL.COUNCIL_TESTNET_URL

  if (!currentProvider) return DocURL.COUNCIL_URL

  switch (currentProvider) {
    case WalletID.Leap:
      return DocURL.COUNCIL_LEAP_URL

    case WalletID.StationWallet || WalletID.StationWalletMobile:
      return DocURL.COUNCIL_STATION_URL

    default:
      return DocURL.COUNCIL_KEPLR_URL
  }
}
