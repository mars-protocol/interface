import { Log } from '@cosmjs/stargate/build/logs'

export const findValue =
  (logs: Log[]) =>
  (key: string, index = 0) => {
    const attribute = logs[index]?.events.find((e) => e.type === 'from_contract')?.attributes

    return attribute?.find((attr) => attr.key === key)?.value ?? ''
  }
