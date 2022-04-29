export const contractQuery = (
    key: string,
    contractAddress: string,
    query: string,
    height?: number
) => {
    const contractKey = key.length > 0 ? `${key}: ` : ``
    if (height) {
        return `
        ${contractKey}contractQuery(contractAddress: "${contractAddress}", query: ${query}, height: ${height})
                `
    }
    return `
        ${contractKey}contractQuery(contractAddress: "${contractAddress}", query: ${query})
                `
}
