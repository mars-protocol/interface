interface NativeAsset {
    native: {
        denom: string
    }
}

interface CW20Asset {
    cw20: {
        contract_addr: string
    }
}

type Asset = NativeAsset | CW20Asset

interface WithdrawTxMessage {
    withdraw: {
        asset: Asset
        amount?: string
    }
}

interface AirdropClaimMessage {
    claim: {
        claim_amount: string
        merkle_proof: string[]
        root_index: number
    }
}
