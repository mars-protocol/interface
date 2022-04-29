import { WalletStatus } from '@terra-money/wallet-provider'
import { GetState } from 'zustand'
import { NamedSet } from 'zustand/middleware'

import { FINDER_URL } from '../../constants/appConstants'
import { InitDataWrapper } from '../../queries-new/BlockHeightQuery'
import { CommonSlice } from './../interfaces/common.interface'

const commonSlice = (
    set: NamedSet<CommonSlice>,
    get: GetState<CommonSlice>
): CommonSlice => ({
    isNetworkLoaded: false,
    isRewardCenterOpen: false,
    latestBlockHeight: 0,
    userWalletAddress: '',
    getFinderUrl: (address: string, path: string = 'account') =>
        `${FINDER_URL}/${get().networkConfig?.chainID}/${path}/${address}`,
    getTax: (amount: string) => '0',
    setIsNetworkSupported: (value: boolean) =>
        set({ isNetworkSupported: value }),
    setIsRewardCenterOpen: (value: boolean) =>
        set({ isRewardCenterOpen: value }),
    processInitQuery: (data: InitDataWrapper) => {
        const blockFetched =
            Number(data.tendermint.blockInfo.block.header.height) || -1

        if (blockFetched !== -1) set({ latestBlockHeight: blockFetched })
    },
    setNetworkAddresses: (addresses: NetworkAddresses) =>
        set({ networkAddresses: addresses }),
    setNetworkInfo: async (networkName: string, status: WalletStatus) => {
        try {
            if (status === WalletStatus.INITIALIZING) return

            const [
                networkAddresses,
                oracleAddresses,
                basecampAddresses,
                assets,
                fieldsStrategies,
                lockdropAddresses,
            ] = await Promise.all([
                import(`../../configs/liquiditypools/${networkName}.json`),
                import(`../../configs/oracles/${networkName}.json`),
                import(`../../configs/basecamp/${networkName}.json`),
                import(`../../configs/whitelists/${networkName}.ts`),
                import(`../../configs/fields/${networkName}.ts`),
                import(`../../configs/lockdrop/${networkName}.json`),
            ])

            set({
                networkAddresses: networkAddresses.default,
                oracleAddresses: oracleAddresses.default,
                basecampAddresses: basecampAddresses.default,
                whitelistedAssets: assets.Whitelist,
                otherAssets: assets.Other,
                fieldsStrategies: fieldsStrategies.default,
                lockdropAddresses: lockdropAddresses.default,
                isNetworkSupported: true,
            })
        } catch (e) {
            set({ isNetworkSupported: false })
        } finally {
            if (status !== WalletStatus.INITIALIZING)
                set({ isNetworkLoaded: true })
        }
    },
    setNetworkConfig: (network: LocalNetworkConfig) =>
        set({ networkConfig: network }),
    setUserWalletAddress: (address: string) =>
        set({ userWalletAddress: address }),
})

export default commonSlice
