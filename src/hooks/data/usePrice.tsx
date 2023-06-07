import useStore from 'store'

export const usePrice = (denom: string): number => {
  const getExchangeRate = useStore((s) => s.getExchangeRate)
  return getExchangeRate(denom)
}
