import { GetState, SetState } from 'zustand'

import commonSlice from './slices/common'
import fieldsSlice from './slices/fields'
import oraclesSlice from './slices/oracles'
import redBankSlice from './slices/redBank'
import { vaultsSlice } from './slices/vaults'

const rootSlice = (set: SetState<any>, get: GetState<any>) => ({
  ...commonSlice(set, get),
  ...redBankSlice(set, get),
  ...oraclesSlice(set, get),
  ...fieldsSlice(set, get),
  ...vaultsSlice(set, get),
})

export default rootSlice
