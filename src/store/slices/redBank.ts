import { GetState } from 'zustand'
import { NamedSet } from 'zustand/middleware'
import { RedBankSlice } from '../interfaces/redBank.interface'

const redBankSlice = (
    set: NamedSet<RedBankSlice>,
    get: GetState<RedBankSlice>
): RedBankSlice => ({
    markets: [],
})

export default redBankSlice
