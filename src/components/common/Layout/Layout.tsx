import { useWalletManager, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import classNames from 'classnames'
import { Footer, Header, MobileNav } from 'components/common'
import { FieldsNotConnected } from 'components/fields'
import { RedbankNotConnected } from 'components/redbank'
import { SESSION_WALLET_KEY } from 'constants/appConstants'
import { useAnimations } from 'hooks/data'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import useStore from 'store'

type Props = {
  children: React.ReactNode
}

export const Layout = ({ children }: Props) => {
  const router = useRouter()
  const { status } = useWalletManager()
  useAnimations()

  const enableAnimations = useStore((s) => s.enableAnimations)
  const isConnected = status === WalletConnectionStatus.Connected
  const backgroundClasses = classNames('background', !isConnected && 'night')
  const vaultConfigs = useStore((s) => s.vaultConfigs)
  const wasConnectedBefore =
    localStorage.getItem(SESSION_WALLET_KEY) &&
    localStorage.getItem(SESSION_WALLET_KEY) !== '[]' &&
    status !== WalletConnectionStatus.Errored

  useEffect(() => {
    if (!isConnected) {
      useStore.setState({ availableVaults: vaultConfigs, activeVaults: [] })
    }
  }, [isConnected, vaultConfigs])

  return (
    <div className={classNames('app', !enableAnimations && 'no-motion')}>
      <div className={backgroundClasses} id='bg' />
      <Header />
      <div className='appContainer'>
        <div className='widthBox'>
          {isConnected || wasConnectedBefore ? (
            <div className={'body'}>{children}</div>
          ) : router.route.includes('farm') ? (
            <FieldsNotConnected />
          ) : (
            <RedbankNotConnected />
          )}
        </div>
        <Footer />
        <MobileNav />
      </div>
    </div>
  )
}
