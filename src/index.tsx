import { StrictMode, Suspense } from 'react'
import { render } from 'react-dom'
import { HashRouter as Router } from 'react-router-dom'
import WalletConnectProvider from './layouts/WalletConnectProvider'
import Network from './layouts/Network'
import App from './layouts/App'
import reportWebVitals from './reportWebVitals'
import './i18n'
import './index.scss'
import CommonContainer from './components/CommonContainer'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

render(
    <Suspense fallback={null}>
        <StrictMode>
            <WalletConnectProvider>
                <QueryClientProvider client={queryClient}>
                    <CommonContainer>
                        <Network>
                            <Router>
                                <App />
                            </Router>
                        </Network>
                    </CommonContainer>
                </QueryClientProvider>
            </WalletConnectProvider>
        </StrictMode>
    </Suspense>,
    document.getElementById('root')
)

reportWebVitals()
