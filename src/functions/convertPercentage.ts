import { formatValue } from 'libs/parse'

export const convertPercentage = (percent: number) => {
  let percentage = percent
  if (percent >= 100) percentage = 100
  if (percent !== 0 && percent < 0.01) percentage = 0.01
  if (percent > 99.99) percentage = 100
  return Number(formatValue(percentage, 0, 2, false, false, false, false, false))
}
