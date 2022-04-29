import { GetState, SetState } from 'zustand'
import commonSlice from './slices/common'
import redBankSlice from './slices/redBank'

const rootSlice = (set: SetState<any>, get: GetState<any>) => ({
    ...commonSlice(set, get),
    ...redBankSlice(set, get),
})

export default rootSlice
