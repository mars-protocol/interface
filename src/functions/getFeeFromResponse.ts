import { Coin } from '@cosmjs/launchpad'
import { TxBroadcastResult } from '@marsprotocol/wallet-connector'
import { extractCoinFromLog } from 'libs/parse'

export const getFeeFromResponse = (response: TxBroadcastResult): Coin | null => {
  const stringValue = response?.response.events
    .filter((msg: Record<string, string>) => msg.type === 'tx')
    .map((msg: Record<string, string>) => msg.attributes)
    .flat()
    .find((msg: Record<string, string>) => msg.key === 'fee')?.value

  if (!stringValue) return null

  return extractCoinFromLog(stringValue)
}
