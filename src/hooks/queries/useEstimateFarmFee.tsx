import { MsgExecuteContract } from '@marsprotocol/wallet-connector'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { GAS_ADJUSTMENT } from 'constants/appConstants'
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

  return useQuery(
    [QUERY_KEYS.ESTIMATE_FARM_FEE, props.actions],
    async () => {
      const gasAdjustment = GAS_ADJUSTMENT

      if (!client) return null

      if (!networkConfig) return null

      try {
        const simulateOptions = {
          messages: [
            new MsgExecuteContract({
              sender: userWalletAddress,
              contract: networkConfig.contracts.creditManager,
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
          ],
          wallet: client.recentWallet,
        }

        const result = await client.simulate(simulateOptions)

        return result.success
          ? {
              amount: result.fee ? result.fee.amount : [],
              gas: new BigNumber(result.fee ? result.fee.gas : 0)
                .multipliedBy(gasAdjustment)
                .toFixed(0),
            }
          : null
      } catch {
        return null
      }
    },
    {
      enabled:
        !props.isLoading &&
        !!client &&
        !!userWalletAddress &&
        (props.isCreate || (!!props.accountId && !!props.actions?.length)),
    },
  )
}
