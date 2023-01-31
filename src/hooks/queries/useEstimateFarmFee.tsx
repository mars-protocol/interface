import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { GasPrice } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { GAS_ADJUSTMENT, GAS_PRICE } from 'constants/appConstants'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'
import { Action, Coin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

interface Props {
  accountId?: string
  actions?: Action[]
  funds?: Coin[]
  isCreate?: boolean
  isLoading: boolean
}

export const useEstimateFarmFee = (props: Props) => {
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const creditManagerMsgComposer = useStore((s) => s.creditManagerMsgComposer)
  const client = useStore((s) => s.client)

  return useQuery(
    [QUERY_KEYS.ESTIMATE_FARM_FEE, props.actions],
    async () => {
      const gasPrice = GasPrice.fromString(GAS_PRICE)
      const gasAdjustment = GAS_ADJUSTMENT

      if (!creditManagerMsgComposer || !client) return null

      let msg: MsgExecuteContractEncodeObject | null = null

      if (props.isCreate) {
        msg = creditManagerMsgComposer.createCreditAccount()
      } else if (props.accountId && props.actions?.length) {
        msg = creditManagerMsgComposer.updateCreditAccount(
          {
            accountId: props.accountId,
            actions: props.actions,
          },
          props.funds,
        )
      }

      if (!msg) return null

      try {
        const gasUsed = await client.simulate(userWalletAddress, [msg], undefined)

        const fee = new BigNumber(Number(gasPrice.amount))
          .multipliedBy(gasUsed)
          .multipliedBy(gasAdjustment)

        return {
          amount: [{ denom: 'uosmo', amount: fee.toFixed(0) }],
          gas: new BigNumber(gasUsed).multipliedBy(gasAdjustment).toFixed(0),
        }
      } catch {
        return null
      }
    },
    {
      enabled:
        !props.isLoading &&
        !!client &&
        !!creditManagerMsgComposer &&
        !!userWalletAddress &&
        (props.isCreate || (!!props.accountId && !!props.actions?.length)),
    },
  )
}
