import { MsgExecuteContract, Coins, Coin } from '@terra-money/terra.js'
import useStore from '../store'

// TODO should this be in hooks? or should these kind of hooks in a specific terra folder...
const useNewContractMsg = () => {
    const sender = useStore((s) => s.userWalletAddress)

    return (
        contract: string,
        msg: object,
        coin?: { denom: string; amount: string }
    ) =>
        new MsgExecuteContract(
            sender,
            contract,
            msg,
            new Coins(coin ? [Coin.fromData(coin)] : [])
        )
}

export default useNewContractMsg
