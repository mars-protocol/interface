type Options = {
  from?: string
  to: string
  baseUrl: string
}

export const getSwapUrl = (options: Options) => {
  const { from, to, baseUrl } = options
  let fromName = from
  let toName = to

  if (!fromName) fromName = 'OSMO'
  if (fromName === to) fromName = 'ATOM'
  if (to === 'axlUSDC') toName = 'USDC'
  if (to === 'axlWBTC') toName = 'WBTC'
  if (to === 'axlWETH') toName = 'ETH'

  return `${baseUrl}?from=${fromName}&to=${toName}`
}
