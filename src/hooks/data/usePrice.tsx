import useStore from 'store'

export const usePrice = (denom: string): number => {
  const convertToBaseCurrency = useStore((s) => s.convertToBaseCurrency)
  return convertToBaseCurrency({ denom, amount: '1' })
}
