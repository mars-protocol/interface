import { useWallet, useWalletManager, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import classNames from 'classnames'
import { Footer, Header, MobileNav, TermsOfService } from 'components/common'
import { FieldsNotConnected } from 'components/fields'
import { RedbankNotConnected } from 'components/redbank'
import { TERMS_OF_SERVICE } from 'constants/appConstants'
import { useAnimations } from 'hooks/data'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import useStore from 'store'

type Props = {
  children: React.ReactNode
}

export const Layout = ({ children }: Props) => {
  const alreadyAcceptedTOS = localStorage.getItem(TERMS_OF_SERVICE)
  const currentlyAcceptedROS = useStore((s) => s.acceptedTermsOfService)

  const router = useRouter()
  const { status } = useWalletManager()
  const currentNetwork = useStore((s) => s.currentNetwork)
  const { wallets } = useWallet()
  const [isConnected, setIsConnected] = useState(false)
  const [wasConnectedBefore, setWasConnectedBefore] = useState(false)
  useAnimations()

  const enableAnimations = useStore((s) => s.enableAnimations)
  const backgroundClasses = classNames('background', !isConnected && 'night')
  const vaultConfigs = useStore((s) => s.vaultConfigs)

  useEffect(() => {
    setIsConnected(status === WalletConnectionStatus.Connected)
    setWasConnectedBefore(!!wallets.find((w) => w.network.chainId === currentNetwork))
  }, [status, wallets, currentNetwork])

  useEffect(() => {
    if (!isConnected) {
      useStore.setState({ availableVaults: vaultConfigs, activeVaults: [] })
    }
  }, [isConnected, vaultConfigs])

  return (
    <div className={classNames('app', !enableAnimations && 'no-motion')}>
      {alreadyAcceptedTOS || currentlyAcceptedROS ? null : <TermsOfService />}

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
