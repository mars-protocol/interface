import { useQuery } from 'react-query'
import { request, gql } from 'graphql-request'
import useStore from '../store'

interface TaxData {
    taxRate: string
    taxCap: {
        amount: string
    }
}

export interface InitDataWrapper {
    treasury: TaxData
    tendermint: {
        blockInfo: {
            block: {
                header: {
                    height: number
                }
            }
        }
    }
}

const useBlockHeightQuery = () => {
    const mantleUrl = useStore((s) => s.networkConfig?.mantle)
    const isNetworkLoaded = useStore((s) => s.isNetworkLoaded) // Needed to detect change of default mainnet to testnet
    const processInitQuery = useStore((s) => s.processInitQuery)
    useQuery<InitDataWrapper>(
        'BlockHeightQuery',
        async () => {
            return await request(
                mantleUrl!,
                gql`
                    query BlockHeightQuery {
                        tendermint {
                            blockInfo {
                                block {
                                    header {
                                        height
                                    }
                                }
                            }
                        }
                    }
                `
            )
        },
        {
            enabled: !!mantleUrl && isNetworkLoaded,
            refetchInterval: 120000,
            onSuccess: processInitQuery,
        }
    )
}

export default useBlockHeightQuery
