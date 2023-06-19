import { MsgExecuteContract } from '@marsprotocol/wallet-connector'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { GAS_ADJUSTMENT } from 'constants/appConstants'
import { getPythVaaMessage } from 'libs/pyth'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'
import { Action, Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

interface Props {
  accountId?: null | string
  actions?: Action[]
  funds?: Coin[]
  isCreate?: boolean
  isLoading: boolean
}

export const useEstimateFarmFee = (props: Props) => {
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const client = useStore((s) => s.client)
  const networkConfig = useStore((s) => s.networkConfig)
  const pythVaa = useStore((s) => s.pythVaa)
  const pythContractAddress = useStore((s) => s.networkConfig.contracts?.pyth)
  const pythVaaMessage = getPythVaaMessage(
    pythVaa,
    networkConfig.assets.base.denom,
    pythContractAddress,
    userWalletAddress,
  )

  const creditManagerAddress = networkConfig.contracts?.creditManager

  return useQuery(
    [QUERY_KEYS.ESTIMATE_FARM_FEE, props.actions],
    async () => {
      const gasAdjustment = GAS_ADJUSTMENT

      if (!client || !creditManagerAddress || !networkConfig) return null
      const messages = [
        new MsgExecuteContract({
          sender: userWalletAddress,
          contract: creditManagerAddress,
          msg: props.isCreate
            ? { create_credit_account: {} }
            : {
                update_credit_account: {
                  account_id: props.accountId,
                  actions: props.actions,
                },
              },
          funds: props.funds,
        }),
      ]

      if (pythVaaMessage) messages.unshift(pythVaaMessage)

      try {
        const simulateOptions = {
          messages,
          wallet: client.connectedWallet,
        }

        const result = await client.simulate(simulateOptions)

        if (result.success) {
          return {
            amount: result.fee ? result.fee.amount : [],
            gas: new BigNumber(result.fee ? result.fee.gas : 0)
              .multipliedBy(gasAdjustment)
              .toFixed(0),
          }
        }
        throw result.error
      } catch (e) {
        console.error(e)
        throw e
      }
    },
    {
      retry: 1,
      enabled:
        !props.isLoading &&
        !!client &&
        !!userWalletAddress &&
        (props.isCreate || (!!props.accountId && !!props.actions?.length)),
    },
  )
}
