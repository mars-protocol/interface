import { WalletID } from '@marsprotocol/wallet-connector'
import { IS_TESTNET } from 'constants/env'
import { DocURL } from 'types/enums/docURL'

export function getCouncilLink(currentProvider?: WalletID): string {
  if (IS_TESTNET) return DocURL.COUNCIL_TESTNET_URL

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
