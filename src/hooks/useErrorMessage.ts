const ZERO_ERROR_LUNA = 'Error: This transaction requires a LUNA amount > 0'
const ZERO_ERROR_UST = 'Error: This transaction requires a UST amount > 0'
const INSUFFICIENT_FUNDS =
    'Error: You do not have enough funds in your account for this transaction'
const INSUFFICIENT_GAS =
    'Error: You do not have enough UST to pay for this transaction'

const useErrorMessage = (message: string): string => {
    if (message.startsWith('insufficient funds: insufficient account funds')) {
        message = 'insufficient funds: insufficient account funds'
    }
    if (
        message.startsWith(
            'insufficient funds: insufficient funds to pay for fees'
        )
    ) {
        message = 'insufficient funds: insufficient funds to pay for fees'
    }

    switch (message) {
        case 'invalid coins: 0uluna':
            return ZERO_ERROR_LUNA
        case 'invalid coins: 0uusd':
            return ZERO_ERROR_UST
        case 'insufficient funds: insufficient account funds':
            return INSUFFICIENT_FUNDS
        case 'insufficient funds: insufficient funds to pay for fees':
            return INSUFFICIENT_GAS
    }
    return message
}

export default useErrorMessage
