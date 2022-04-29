import { TxLog } from '@terra-money/terra.js'

export const findValue =
    (logs: TxLog[]) =>
    (key: string, index = 0) => {
        const attribute = logs[index]?.events.find(
            (e) => e.type === 'from_contract'
        )?.attributes

        return attribute?.find((attr) => attr.key === key)?.value ?? ''
    }
