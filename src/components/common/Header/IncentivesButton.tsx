import { BroadcastResult } from '@delphi-labs/shuttle-react'
import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import {
  AnimatedNumber,
  Button,
  DisplayCurrency,
  ErrorMessage,
  SVG,
  Tooltip,
  TxLink,
} from 'components/common'
import { MARS_SYMBOL } from 'constants/appConstants'
import { CHAINS } from 'constants/chains'
import { findByDenom } from 'functions'
import { getClaimUserRewardsMsgOptions } from 'functions/messages'
import { useEstimateFee } from 'hooks/queries'
import { lookup, lookupSymbol } from 'libs/parse'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from 'store'
import { State } from 'types/enums'
import { QUERY_KEYS } from 'types/enums/queryKeys'
import { ChainInfoID } from 'types/enums/wallet'

import styles from './IncentivesButton.module.scss'

export const IncentivesButton = () => {
  // ---------------
  // EXTERNAL HOOKS
  // ---------------
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // ---------------
  // STORE STATE
  // ---------------
  const client = useStore((s) => s.client)
  const whitelistedAssets = useStore((s) => s.networkConfig.assets.whitelist)
  const otherAssets = useStore((s) => s.networkConfig.assets.other)
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const networkConfig = useStore((s) => s.networkConfig)
  const unclaimedRewards = useStore((s) => s.userUnclaimedRewards)
  const convertToDisplayCurrency = useStore((s) => s.convertToDisplayCurrency)
  const marsPriceState = useStore((s) => s.marsPriceState)
  const incentivesContractAddress = useStore((s) => s.networkConfig.contracts.incentives)
  const chainInfo = useStore((s) => s.chainInfo)
  const executeMsg = useStore((s) => s.executeMsg)

  // ---------------
  // LOCAL STATE
  // ---------------
  const [showDetails, setShowDetails] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [response, setResponse] = useState<BroadcastResult>()
  const [error, setError] = useState<string>()
  const [hasUnclaimedRewards, setHasUnclaimedRewards] = useState(false)
  const [unclaimedRewardsValue, setUnclaimedRewardsValue] = useState(0)

  // ---------------
  // LOCAL VARIABLES
  // ---------------
  const explorerUrl = chainInfo && CHAINS[chainInfo.chainId as ChainInfoID].explorer
  const assets = [...whitelistedAssets, ...otherAssets]

  // ---------------
  // FUNCTIONS
  // ---------------
  const onClickAway = useCallback(() => {
    setShowDetails(false)
    setResponse(undefined)
    setError(undefined)
  }, [])

  useEffect(() => {
    let rewardsValue = 0
    let rewardsAmount = 0

    if (marsPriceState !== State.READY) return
    unclaimedRewards.forEach((reward) => {
      rewardsValue += convertToDisplayCurrency(reward)
      rewardsAmount += Number(reward.amount)
    })

    setUnclaimedRewardsValue(rewardsValue)
    setHasUnclaimedRewards(rewardsAmount > 0)
  }, [unclaimedRewards, convertToDisplayCurrency, marsPriceState])

  const txMsgOptions = useMemo(() => {
    if (!hasUnclaimedRewards) return
    return getClaimUserRewardsMsgOptions()
  }, [hasUnclaimedRewards])

  const { data: fee, error: feeError } = useEstimateFee({
    msg: txMsgOptions?.msg,
    funds: [],
    contract: incentivesContractAddress,
  })

  if (feeError && error !== feeError && !fee) {
    setError(feeError as string)
  }

  useEffect(() => {
    const isFetching = submitted || (!fee && !response && hasUnclaimedRewards)
    if (fetching === isFetching) return
    setFetching(isFetching)
  }, [submitted, fetching, fee, response, hasUnclaimedRewards])

  useEffect(() => {
    if (error) {
      setDisabled(!hasUnclaimedRewards)
      setSubmitted(false)
      return
    }
    if (response?.hash) {
      setDisabled(true)
      setSubmitted(false)
      return
    }

    setDisabled(!hasUnclaimedRewards)
  }, [error, response, hasUnclaimedRewards])

  const claimRewards = async () => {
    if (!incentivesContractAddress || !client) {
      setError(t('error.errorClaim'))
      setDisabled(true)
      setSubmitted(false)
      return
    }
    setDisabled(true)
    setSubmitted(true)
    setError(undefined)

    if (!fee || !txMsgOptions) {
      return
    }

    try {
      const res = await executeMsg({
        msg: txMsgOptions.msg,
        funds: [],
        contract: incentivesContractAddress,
        fee,
      })

      setResponse(res)
      queryClient.invalidateQueries([QUERY_KEYS.REDBANK])
    } catch (error) {
      const e = error as { message: string }
      setError(e.message as string)
    }
  }

  const transactionHash = response?.hash || ''
  if (!userWalletAddress) return null

  return (
    <div className={styles.wrapper}>
      <button
        className={classNames(
          unclaimedRewardsValue > 1 ? `${styles.button} ${styles.buttonHighlight}` : styles.button,
        )}
        onClick={() => {
          setShowDetails(!showDetails)
        }}
      >
        {networkConfig.hasMultiAssetIncentives ? (
          <AnimatedNumber
            amount={unclaimedRewardsValue}
            minDecimals={2}
            maxDecimals={2}
            prefix='$'
          />
        ) : (
          <>
            <SVG.Logo />
            <span>
              <AnimatedNumber
                className={styles.marsAmount}
                amount={Number(unclaimedRewards[0]?.amount ?? 0) / 1e6}
                minDecimals={2}
                maxDecimals={2}
              />
            </span>
            {MARS_SYMBOL}
          </>
        )}
      </button>

      {showDetails && (
        <>
          <div className={styles.details}>
            <div className={styles.detailsHeader}>
              <p className={styles.detailsHead}>{t('incentives.marsRewardsCenter')}</p>
              <div className={styles.tooltip}>
                <Tooltip content={t('incentives.marsRewardsCenterTooltip')} />
              </div>
            </div>

            <div className={styles.detailsBody}>
              {response ? (
                <div className={`${styles.container} ${styles.info}`}>
                  <p className='m'>{t('incentives.successfullyClaimed')}</p>
                  <TxLink hash={transactionHash} link={`${explorerUrl}/txs/${transactionHash}`} />
                </div>
              ) : (
                <>
                  {unclaimedRewards.map((rewards, index) => {
                    const asset = findByDenom(assets, rewards.denom)
                    if (!asset) return null
                    return (
                      <div className={styles.container} key={index}>
                        <div className={styles.position}>
                          <div className={styles.label}>
                            <p className={styles.token}>{lookupSymbol(asset.denom, assets)}</p>
                            <p className={styles.subhead}>{t('redbank.redBankRewards')}</p>
                          </div>
                          <div className={styles.value}>
                            <AnimatedNumber
                              className={styles.tokenAmount}
                              amount={lookup(
                                Number(rewards.amount) || 0,
                                asset.symbol,
                                asset.decimals,
                              )}
                              maxDecimals={asset.decimals}
                              minDecimals={2}
                            />
                            <DisplayCurrency
                              className={styles.tokenValue}
                              coin={{
                                amount: rewards.amount,
                                denom: asset.denom,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
              <div className={styles.claimButton}>
                <Button
                  disabled={disabled}
                  showProgressIndicator={fetching}
                  text={
                    hasUnclaimedRewards && !disabled
                      ? t('incentives.claimRewards')
                      : t('incentives.nothingToClaim')
                  }
                  onClick={() => (submitted ? null : claimRewards())}
                  color='primary'
                />
                <ErrorMessage message={error} alignment='center' />
              </div>
            </div>
          </div>
          <div className={styles.clickAway} onClick={onClickAway} role='button' />
        </>
      )}
    </div>
  )
}
