type Options = {
  from?: string
  to: string
  baseUrl: string
}

export const getSwapUrl = (options: Options) => {
  const { from, to, baseUrl } = options
  let fromName = from

  if (!fromName) fromName = 'ATOM'
  if (fromName === to) fromName = 'OSMO'

  return `${baseUrl}?from=${fromName}&to=${to}`
}
