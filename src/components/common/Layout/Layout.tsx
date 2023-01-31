import { useWallet, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
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
  useAnimations()

  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const enableAnimations = useStore((s) => s.enableAnimations)
  const backgroundClasses = classNames('background', !userWalletAddress && 'night')
  const vaultConfigs = useStore((s) => s.vaultConfigs)
  const wallet = useWallet()
  const wasConnectedBefore = !!localStorage.getItem(SESSION_WALLET_KEY)
  const connectionSuccess = !!(
    (wallet.status === WalletConnectionStatus.Connecting && wasConnectedBefore) ||
    wallet.status === WalletConnectionStatus.Connected
  )
  const isConnected = !!userWalletAddress || connectionSuccess

  useEffect(() => {
    if (!userWalletAddress) {
      useStore.setState({ availableVaults: vaultConfigs, activeVaults: [] })
    }
  }, [userWalletAddress, vaultConfigs])

  return (
    <div className={classNames('app', !enableAnimations && 'no-motion')}>
      <div className={backgroundClasses} id='bg' />
      <Header />
      <div className='appContainer'>
        <div className='widthBox'>
          {isConnected ? (
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
