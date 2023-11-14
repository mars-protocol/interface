import { useShuttle } from '@delphi-labs/shuttle-react'
import { Button, Modal } from 'components/common'
import { WALLETS } from 'constants/wallets'
import { getCurrentChainId } from 'libs/chainId'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { isIOS, isMobile } from 'react-device-detect'
import QRCode from 'react-qr-code'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'

import styles from './WalletSelect.module.scss'

interface Props {
  error?: ErrorObject
}

interface ErrorObject {
  title: string
  message: string
}

interface WalletOptionProps {
  name: string
  description?: string
  imageSrc: string
  handleClick: () => void
  showLoader?: boolean
}

function WalletOption(props: WalletOptionProps) {
  return (
    <div onClick={props.handleClick} className={styles.walletOption}>
      <Image
        className='rounded-full'
        width={60}
        height={60}
        src={props.imageSrc}
        alt={props.name}
      />
      <div className={styles.info}>
        <p className={styles.name}>{props.name}</p>
        {props.description && <p className={styles.description}>{props.description}</p>}
      </div>
    </div>
  )
}

export const WalletSelect = () => {
  const { extensionProviders, mobileProviders, mobileConnect } = useShuttle()
  const [qrCodeUrl, setQRCodeUrl] = useState('')
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState<string | boolean>(false)
  const sortedExtensionProviders = extensionProviders.sort((a, b) => +b - +a)
  const networkConfig = useStore((s) => s.networkConfig)
  const showWalletSelect = useStore((s) => s.showWalletSelect)
  const currentChainId = getCurrentChainId()

  const handleConnectClick = (extensionProviderId: WalletID) => {
    useStore.setState({
      walletConnecting: { show: true, providerId: extensionProviderId },
      showWalletSelect: false,
    })
  }

  const handleMobileConnectClick = async (mobileProviderId: string, chainId: string) => {
    setIsLoading(mobileProviderId)
    try {
      const urls = await mobileConnect({
        mobileProviderId,
        chainId,
        callback: () => {
          setQRCodeUrl('')
          setIsLoading(false)
          useStore.setState({
            showWalletSelect: false,
            walletConnecting: { show: true, providerId: mobileProviderId as WalletID },
          })
        },
      })

      if (isMobile) {
        let mobileUrl = urls.androidUrl
        if (isIOS) mobileUrl = urls.iosUrl
        window.location.href = mobileUrl
      } else {
        setQRCodeUrl(urls.qrCodeUrl)
      }
    } catch (error) {
      if (error instanceof Error) {
        setQRCodeUrl('')
        setIsLoading(false)
        console.error('Failed to connect to wallet:', error.message)
        setError(true)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (error) {
      useStore.setState({
        walletConnecting: undefined,
        showWalletSelect: false,
      })
    }
  }, [error])

  if (!showWalletSelect) return null

  if (qrCodeUrl)
    return (
      <Modal
        title={'Scan the QR Code'}
        copy={
          'Open your mobile wallet App and use the QR Scan function to connect via WalletConnect v2'
        }
        onClose={() => setQRCodeUrl('')}
      >
        <div className={styles.qrCode}>
          <QRCode value={qrCodeUrl} />
        </div>
        <Button
          className={styles.qrButton}
          text='Close'
          color='primary'
          onClick={() => setQRCodeUrl('')}
        />
      </Modal>
    )

  return (
    <Modal title={'Select a wallet'} onClose={() => useStore.setState({ showWalletSelect: false })}>
      <div className={styles.listContainer}>
        {!isMobile && (
          <>
            {sortedExtensionProviders.map((provider) => {
              const walletId = provider.id as WalletID
              return (
                <React.Fragment key={walletId}>
                  {Array.from(provider.networks.values())
                    .filter((network) => network.chainId === currentChainId)
                    .map((network) => {
                      if (!provider.initialized && !provider.initializing) {
                        return (
                          <WalletOption
                            key={`${walletId}-${network.chainId}`}
                            handleClick={() => {
                              window.open(WALLETS[walletId].installURL ?? '/', '_blank')
                            }}
                            imageSrc={WALLETS[walletId].imageURL}
                            name={WALLETS[walletId].install ?? 'Install Wallet'}
                            description={WALLETS[walletId]?.installURL}
                          />
                        )
                      }

                      return (
                        <WalletOption
                          key={`${walletId}-${network.chainId}`}
                          handleClick={() => handleConnectClick(walletId)}
                          imageSrc={WALLETS[walletId].imageURL}
                          name={WALLETS[walletId].name}
                          description={WALLETS[walletId].description}
                        />
                      )
                    })}
                </React.Fragment>
              )
            })}
          </>
        )}
        {mobileProviders.map((provider) => {
          const walletId = provider.id as WalletID
          return (
            <React.Fragment key={walletId}>
              {Array.from(provider.networks.values())
                .filter((network) => network.chainId === currentChainId)
                .map((network) => {
                  return (
                    <WalletOption
                      key={`${walletId}-${network.chainId}`}
                      name={
                        isMobile
                          ? WALLETS[walletId].name
                          : WALLETS[walletId].walletConnect ?? 'WalletConnect'
                      }
                      imageSrc={
                        isMobile
                          ? WALLETS[walletId].imageURL
                          : WALLETS[walletId].mobileImageURL ?? '/'
                      }
                      handleClick={() => handleMobileConnectClick(walletId, network.chainId)}
                      showLoader={isLoading === walletId}
                    />
                  )
                })}
            </React.Fragment>
          )
        })}
      </div>
    </Modal>
  )
}
