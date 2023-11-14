import 'i18n'
import 'index.scss'
import 'styles/App.scss'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { CommonContainer, FieldsContainer, Layout } from 'components/common'
import { WalletConnectProvider } from 'components/common/Wallet/WalletConnectProvider'
import type { AppProps, NextWebVitalsMetric } from 'next/app'
import Head from 'next/head'
import { Suspense, useEffect, useState } from 'react'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })
const queryClient = new QueryClient()

const App = ({ Component, pageProps }: AppProps) => {
  const [isServer, setIsServer] = useState(true)
  useEffect(() => {
    setIsServer(false)
  }, [])
  if (isServer) return null

  return (
    <>
      <Head>
        <meta content='width=device-width,initial-scale=1,shrink-to-fit=no' name='viewport' />
        <title>Mars Protocol</title>
      </Head>
      <Suspense fallback={null}>
        <WalletConnectProvider>
          <QueryClientProvider client={queryClient}>
            <CommonContainer>
              <FieldsContainer>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </FieldsContainer>
            </CommonContainer>
          </QueryClientProvider>
        </WalletConnectProvider>
      </Suspense>
    </>
  )
}

export function reportWebVitals(metric: NextWebVitalsMetric) {}

export default App
