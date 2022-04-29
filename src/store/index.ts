import create, { StoreApi, UseBoundStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import store from './store'
import { Store } from './interfaces/store.interface'

let useStore: UseBoundStore<Store, StoreApi<Store>>

if (process.env.NODE_ENV !== 'production') {
    useStore = create<Store>(devtools(store, { name: 'store' }))
} else {
    useStore = create<Store>(store)
}

export default useStore
