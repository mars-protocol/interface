import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { toUtf8 } from '@cosmjs/encoding'
import { Coin } from '@cosmjs/proto-signing'
import { GasPrice } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { GAS_ADJUSTMENT, GAS_PRICE } from 'constants/appConstants'
import useStore from 'store'
import { QUERY_KEYS } from 'types/enums/queryKeys'
import { ContractMsg } from 'types/types'

interface Props {
  msg?: ContractMsg
  funds?: Coin[]
  contract?: string
  sender?: string
  executeMsg?: MsgExecuteContractEncodeObject
}

export const useEstimateFee = (props: Props) => {
  const userWalletAddress = useStore((s) => s.userWalletAddress)
  const client = useStore((s) => s.client)

  return useQuery(
    [QUERY_KEYS.ESTIMATE_FEE],
    async () => {
      const sender = props.sender ? props.sender : userWalletAddress
      const gasPrice = GasPrice.fromString(GAS_PRICE)
      const gasAdjustment = GAS_ADJUSTMENT

      if (!client) return

      const msg = props.executeMsg
        ? props.executeMsg
        : {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: {
              sender: sender,
              contract: props.contract,
              msg: toUtf8(JSON.stringify(props.msg)),
              funds: props.funds,
            },
          }

      try {
        const gasUsed = await client.simulate(sender, [msg], undefined)

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
      enabled: !!client && ((!!props.msg && !!props.contract) || !!props.executeMsg),
    },
  )
}
