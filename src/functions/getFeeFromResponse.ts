import { Coin } from '@cosmjs/launchpad'
import { BroadcastResult } from '@delphi-labs/shuttle-react'
import { extractCoinFromLog } from 'libs/parse'

export const getFeeFromResponse = (response: BroadcastResult): Coin | null => {
  const stringValue = response?.response.events
    .filter((msg: Record<string, string>) => msg.type === 'tx')
    .map((msg: Record<string, string>) => msg.attributes)
    .flat()
    .find((msg: Record<string, string>) => msg.key === 'fee')?.value

  if (!stringValue) return null

  return extractCoinFromLog(stringValue)
}
