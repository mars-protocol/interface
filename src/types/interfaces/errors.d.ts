interface ErrorWithLabel {
  hasError: boolean
  label: string
}

interface FieldsErrors {
  redbankNoLiquidity: ErrorWithLabel
  uncollateralisedLoanLimit: ErrorWithLabel
}
