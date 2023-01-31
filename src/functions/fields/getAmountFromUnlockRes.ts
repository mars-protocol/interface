import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'

export const getAmountFromUnlockRes = (unlockData: ExecuteResult) => {
  const stringValue = unlockData?.logs[0].events
    .find((item) => item.type === 'coin_received')
    ?.attributes.find((item) => item.key === 'amount')?.value

  if (!stringValue) return ''

  if (stringValue?.indexOf('ibc/') > 0) {
    return stringValue.split('ibc/')[0]
  }
  return stringValue.split('factory/')[0]
}
