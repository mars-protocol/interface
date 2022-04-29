import { useState } from 'react'
import createContext from './createContext'

interface Errors {
    /** Whether errors are present */
    errors: {
        network: boolean
        query: boolean
        server: boolean
    }
    /** List of queries that are failing */
    queryErrors: string[]
    setNetworkError: (isError: boolean) => void
    setQueryError: (name: string, isError: boolean) => void
    setServerError: (isError: boolean) => void
}

export const [useErrors, ErrorsProvider] = createContext<Errors>('useErrors')

export const UseErrorsState = (): Errors => {
    const [errors, setErrors] = useState<Errors['errors']>({
        query: false,
        network: false,
        server: false,
    })
    const [queryErrors, setQueryErrors] = useState<string[]>([])

    const setNetworkError = (isError: boolean) => {
        if (isError !== errors.network) {
            errors.network = isError
            setErrors({ ...errors })
        }
    }

    const setServerError = (isError: boolean) => {
        if (isError !== errors.server) {
            errors.server = isError
            setErrors({ ...errors })
        }
    }

    const setQueryError = (name: string, isError: boolean) => {
        let queryErrorsCopy = [...queryErrors]

        if (isError && !queryErrorsCopy.includes(name)) {
            queryErrorsCopy.push(name)
            errors.query = true
            setErrors({ ...errors })
            setQueryErrors(queryErrorsCopy)
        } else if (!isError && queryErrorsCopy.includes(name)) {
            const idx = queryErrorsCopy.indexOf(name)
            queryErrorsCopy.splice(idx, 1)
            errors.query = !!queryErrorsCopy.length
            setErrors({ ...errors })
            setQueryErrors(queryErrorsCopy)
        }
    }

    return {
        errors,
        queryErrors,
        setNetworkError,
        setQueryError,
        setServerError,
    }
}
