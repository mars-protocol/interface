type Options = {
  from?: string
  to: string
  baseUrl: string
}

export const getSwapUrl = (options: Options) => {
  const { from, to, baseUrl } = options
  let fromName = from
  let toName = to

  if (!fromName) fromName = 'ATOM'
  if (fromName === to) fromName = 'OSMO'
  if (to === 'axlUSDC') toName = 'USDC'

  return `${baseUrl}?from=${fromName}&to=${toName}`
}
