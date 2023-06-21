import { MsgExecuteContract } from '@marsprotocol/wallet-connector'

export const getPythVaaMessage = (
  pythVaa: VaaInformation,
  baseCurrencyDenom: string,
  isLedger: boolean,
  pythContractAddress?: string,
  sender?: string,
): MsgExecuteContract | undefined => {
  if (!sender || pythVaa.data.length === 0 || !pythContractAddress || isLedger) return

  return new MsgExecuteContract({
    sender,
    contract: pythContractAddress,
    msg: { update_price_feeds: { data: pythVaa.data } },
    funds: [{ denom: baseCurrencyDenom, amount: String(pythVaa.data.length) }],
  })
}
