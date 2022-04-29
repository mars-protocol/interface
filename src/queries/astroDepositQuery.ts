export const deposit = (user: string, lpToken: string) => {
    return `{
        deposit: {
            lp_token: "${lpToken}",
            user: "${user}"
        }
    }`
}
