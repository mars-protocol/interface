import {
    ApolloClient,
    InMemoryCache,
    NormalizedCacheObject,
} from '@apollo/client'

interface Mantle {
    produceClient: (graphUrl: string) => ApolloClient<NormalizedCacheObject>
}

export const useMantle = (): Mantle => {
    // todo singleton?
    const produceClient = (graphUrl: string) => {
        const client = new ApolloClient({
            uri: graphUrl,
            cache: new InMemoryCache(),
        })

        return client
    }

    return { produceClient }
}
