import { ChainInfoID, WalletID } from '@marsprotocol/wallet-connector'
import { SUPPORTED_CHAINS } from 'constants/appConstants'
import { DocURL } from 'types/enums/docURL'

export function getCouncilLink(currentNetwork: ChainInfoID, currentProvider?: WalletID): string {
  const isTestnet =
    SUPPORTED_CHAINS.find((chain) => chain.chainId === currentNetwork)?.type === 'testnet'

  if (isTestnet) return DocURL.COUNCIL_TESTNET

  if (!currentProvider) return DocURL.COUNCIL

  switch (currentProvider) {
    case WalletID.Leap:
      return DocURL.COUNCIL_LEAP

    case WalletID.Station:
      return DocURL.COUNCIL_STATION

    default:
      return DocURL.COUNCIL_KEPLR
  }
}
