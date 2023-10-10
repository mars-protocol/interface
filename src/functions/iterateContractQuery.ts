import { ITEM_LIMIT_PER_QUERY } from 'constants/appConstants'

interface KeyProperties {
  denom?: string
  addr?: string
}

type Query<T> = ({
  limit,
  startAfter,
}: {
  limit?: number | undefined
  startAfter?: string | undefined
}) => Promise<T[]>

export async function iterateContractQuery<T extends KeyProperties>(
  query: Query<T>,
  keyProperty: keyof KeyProperties = 'denom',
  previousResults?: T[],
): Promise<T[]> {
  const lastItem = previousResults && previousResults.at(-1)
  const lastItemKey = lastItem && lastItem[keyProperty]
  const params = {
    limit: ITEM_LIMIT_PER_QUERY,
    startAfter: lastItemKey,
  }

  const results = await query(params)
  const accumulated = (previousResults ?? []).concat(results)

  if (results.length < ITEM_LIMIT_PER_QUERY) {
    return accumulated
  }

  return await iterateContractQuery(query, keyProperty, accumulated)
}
