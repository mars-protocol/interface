export interface ErrorWithLabel {
    hasError: boolean
    label: string
}

export interface FieldsErrors {
    redbankNoLiquidity: ErrorWithLabel
    uncollateralisedLoanLimit: ErrorWithLabel
}
