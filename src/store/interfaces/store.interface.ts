import { CommonSlice } from './common.interface'
import { FieldsSlice } from './fields.interface'
import { OraclesSlice } from './oracles.interface'
import { RedBankSlice } from './redBank.interface'
import { VaultsSlice } from './vaults.interface.'

export interface Store extends CommonSlice, RedBankSlice, OraclesSlice, FieldsSlice, VaultsSlice {}
