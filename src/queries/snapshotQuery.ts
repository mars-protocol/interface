export const snapshotQuery = (userAddress: string) => {
    return `{
                snapshot: {
                    user: "${userAddress}"
                }
            }`
}
