import create, { StoreApi, UseBoundStore } from 'zustand'
import { devtools } from 'zustand/middleware'

import { Store } from './interfaces/store.interface'
import store from './store'

let useStore: UseBoundStore<StoreApi<Store>>

if (process.env.NODE_ENV !== 'production') {
  useStore = create(devtools(store))
} else {
  useStore = create<Store>(store)
}

export default useStore
