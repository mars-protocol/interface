import { FC } from 'react'
import { ErrorsProvider, UseErrorsState } from '../hooks/useErrors'

const ErrorsProviderWrapper: FC = ({ children }) => {
    const errorsState = UseErrorsState()

    return <ErrorsProvider value={errorsState}>{children}</ErrorsProvider>
}

export default ErrorsProviderWrapper
