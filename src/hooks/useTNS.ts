import { useState, useEffect } from 'react'
import { TNS } from '@tns-money/tns.js'
import { truncate } from '../libs/text'

const tns = new TNS()

/**
 * Get TNS name for a given wallet address
 * @param address TNS address
 */
export const useTNS = (address: string, truncated: boolean) => {
    const [name, setName] = useState<string | null>(null)

    useEffect(() => {
        async function fetchTNSName() {
            const name = await tns.getName(address)
            setName(name)
        }
        fetchTNSName()
    }, [address])

    if (!truncated) return name
    if (name === null) return null
    if (name.length <= 10) return name

    const splitName = name.split('.ust')
    if (splitName[0].length <= 10) return splitName

    return truncate(name, [6, 0])
}
