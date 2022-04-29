import { FC, useEffect, useState } from 'react'

import { ContractProvider, useContractState } from '../hooks/useContract'
import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    from,
    InMemoryCache,
    NormalizedCacheObject,
} from '@apollo/client'
import { BatchHttpLink } from '@apollo/client/link/batch-http'
import { onError } from '@apollo/client/link/error'
import ErrorBanner from '../components/ErrorBanner'
import { useWallet } from '@terra-money/wallet-provider'
import useStore from '../store'

const Network: FC = ({ children }) => {
    const lcd = useStore((s) => s.networkConfig?.lcd)
    const chainID = useStore((s) => s.networkConfig?.chainID)
    const gasPriceUrl = useStore((s) => s.networkConfig?.gasPriceURL)
    const mantleUrl = useStore((s) => s.networkConfig?.mantle)
    const isNetworkSupported = useStore((s) => s.isNetworkSupported)

    const contractInteractor = useContractState(lcd!, chainID!, gasPriceUrl!)

    const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>()
    const { network: extNetwork } = useWallet()
    // const { errors, setNetworkError, setQueryError, setServerError } =
    //     useErrors()

    /** successLink is responsible for removing errors states in useErrors hook */
    const successLink = new ApolloLink((operation, forward) => {
        return forward(operation).map((data) => {
            // Remove queryError from list when it succeeds
            // If there is no error, this means the network and server are online
            if (!data.errors) {
                // setQueryError(operation.operationName, false)
                // setNetworkError(false)
                // setServerError(false)
            }
            return data
        })
    })

    /** errorLink is responsible for logging errors to Sentry and adding errors states in useErrors hook */
    const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
        if (graphQLErrors) {
            const queryName = operation.operationName

            graphQLErrors.forEach(({ message, locations, path }) => {
                if (process.env.NODE_ENV === 'development') {
                    console.error(
                        `[GraphQL error]: Query: ${queryName} with variables: ${JSON.stringify(
                            operation.variables
                        )} failed`
                    )
                }
            })

            // Add the failed query to the queryErrors
            // setQueryError(operation.operationName, true)
        }

        if (networkError) {
            // Client offline
            // if (window && !window.navigator.onLine && !errors.network) {
            //     // setNetworkError(true)
            //     // Server offline
            // } else if (!errors.network) {
            //     // setServerError(true)
            // }
        }
    })

    useEffect(() => {
        const additiveLink = from([
            successLink,
            errorLink,
            new BatchHttpLink({
                uri: mantleUrl,
                batchMax: 3,
                batchInterval: 200,
            }),
        ])
        setClient(
            new ApolloClient({
                link: additiveLink,
                uri: mantleUrl,
                cache: new InMemoryCache(),
            })
        )
        // eslint-disable-next-line
    }, [extNetwork.name, mantleUrl])

    if (!client) return <></>

    return (
        <>
            <ErrorBanner
                // hasNetworkError={errors.network}
                // hasQueryError={errors.query}
                // hasServerError={errors.server}
                hasNetworkError={false}
                hasQueryError={false}
                hasServerError={false}
                isNetworkSupported={isNetworkSupported}
            />
            <ApolloProvider client={client}>
                <ContractProvider value={contractInteractor}>
                    {children}
                </ContractProvider>
            </ApolloProvider>
        </>
    )
}

export default Network
