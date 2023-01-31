export const getSnapshotQuery = (userAddress: string) => {
  return `{
                snapshot: {
                    user: "${userAddress}"
                }
            }`
}
