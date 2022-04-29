import { CreateTxOptions, LCDClient, TxAPI } from '@terra-money/terra.js'
import { TxResult, useWallet } from '@terra-money/wallet-provider'
import BigNumber from 'bignumber.js'
import useStore from '../store'
import createContext from './createContext'

interface Contract {
    query: <T>(
        contractAddress: string,
        queryMsg: object,
        retries?: number,
        ignoreFailures?: boolean
    ) => Promise<T | undefined>
    post: (
        options: CreateTxOptions,
        retries?: number
    ) => Promise<TxResult | undefined>
    estimateFee: (
        options: CreateTxOptions,
        sourceAddress?: string,
        retries?: number,
        ignoreFailures?: boolean
    ) => Promise<Fee>
}

export const [useContract, ContractProvider] =
    createContext<Contract>('useContract')

export const useContractState = (
    lcd: string,
    chainID: string,
    gasPriceUrl: string
): Contract => {
    const { post: postTx } = useWallet()
    const userWalletAddress = useStore((s) => s.userWalletAddress)
    // const { setQueryError } = useErrors()

    const getLcd = () => {
        const terra = new LCDClient({
            URL: lcd,
            chainID: chainID,
        })

        return terra
    }

    /**
     * Wrapper for terra.js contract query. This handles the request with retries upon failure until the set amount (default is 3).
     * If the request continually fails it will set a failed state on the network hook.
     *
     * @param contractAddress The address of the contract we are querying
     * @param queryMsg Query msg, in object form (e.g {'token_info' : {}})
     * @param retries The max amount of retries before setting an errored state and returning null.
     * @returns The reponse from the query, or null if the query fails
     */
    const query = async <T>(
        contractAddress: string,
        queryMsg: object,
        retries: number = 3,
        ignoreFailures: boolean = false
    ) => {
        let attempts = 0
        while (attempts < retries) {
            if (!lcd || !chainID) return
            const terra = getLcd()
            try {
                const res = await terra.wasm.contractQuery<Promise<T>>(
                    contractAddress,
                    queryMsg
                )
                // setQueryError('contractQuery', false)
                return res
            } catch (exception: any) {
            } finally {
                attempts += 1
            }
            if (attempts === retries && !ignoreFailures) {
                // setQueryError('contractQuery', true)
            }
        }
    }

    const getGasPrice = async (): Promise<number> => {
        return (await fetch(gasPriceUrl)).json().then((json) => json['uusd'])
    }

    const estimateFee = async (
        options: CreateTxOptions,
        sourceAddress: string = userWalletAddress,
        retries: number = 3,
        ignoreFailures: boolean = false
    ): Promise<Fee> => {
        if (!sourceAddress) {
            // return default object
            return {
                gas: 0,
                gasPrice: 0,
                amount: 0,
            }
        }

        const terra = new LCDClient({
            URL: lcd,
            chainID: chainID,
            gasAdjustment: 1.6,
        })
        const txApi = new TxAPI(terra)
        // Estimates are not accurate and do not account for things such as loops, so we add an adjustment to ensure it is enough.
        options.feeDenoms = ['uusd']

        let attempts = 0

        while (attempts < retries) {
            try {
                const feeEstimate = await txApi.create(
                    [{ address: sourceAddress }],
                    options
                )
                const gasPrice = await getGasPrice()
                const amount = new BigNumber(
                    // gas_limit is the total estimated gas units used to execute this tx
                    feeEstimate.auth_info.fee.gas_limit
                )
                    // gas price is what we should multiple the gas limit by to get the gas amount
                    // we are only paying for gas in uusd, so gasPrice here refers to gas price in uusd
                    // however gasPrice could be in any native asset, and can change over time
                    .multipliedBy(gasPrice)
                    // It appears the network nodes validate gasPrice via amount / gas rather than looking
                    // at the gasPrice supplied, because of precision issues we need to use BigNumber lib
                    // to round ceil otherwise we can come in short with the gasPrice e.g.
                    // - Network has gasPrice set at 0.15uusd
                    // - simulate fee returns gas limit of 6219537 (after gas adjustment)
                    // - amount = 6219537 * 0.15 = 932930.55uusd which will be truncated to 932930uusd
                    // - network node calculates gasPrice via 932930 / 6219537 = 0.149999... = less than 0.15
                    .integerValue(BigNumber.ROUND_CEIL)
                    .toNumber()

                // setQueryError('estimateFee', false)

                return {
                    gas: feeEstimate.auth_info.fee.gas_limit,
                    gasPrice: gasPrice,
                    amount: amount,
                }
            } catch (exception: any) {
                if (
                    exception?.response?.status &&
                    (exception.response.status === 400 ||
                        exception.response.status === 429)
                ) {
                    break
                }
            } finally {
                attempts += 1
            }
        }
        if (!ignoreFailures) {
            // if we reach here we failed 3 times
            // setQueryError('estimateFee', true)
        }

        // return default object
        return {
            gas: 0,
            gasPrice: 0,
            amount: 0,
        }
    }

    const post = async (
        options: CreateTxOptions,
        retries = 1
    ): Promise<TxResult | undefined> => {
        let attempts = 0
        while (attempts < retries) {
            try {
                return postTx(options)
            } catch (exception) {
                console.debug(exception)
            } finally {
                attempts += 1
            }
        }
    }

    return { query, post, estimateFee }
}
