export function truncate(text = '', [h, t]: [number, number] = [6, 6]): string {
  const head = text.slice(0, h)
  if (t === 0) return text.length > h + t ? head + '...' : text
  const tail = text.slice(-1 * t, text.length)
  if (h === 0) return text.length > h + t ? '...' + tail : text
  return text.length > h + t ? [head, tail].join('...') : text
}

export function camelize(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return '' // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase()
  })
}
