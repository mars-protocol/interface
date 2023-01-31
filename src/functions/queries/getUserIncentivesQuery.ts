export const getUserIncentivesQuery = (address: string) => {
  return `{
                user_unclaimed_rewards: {
                    user: "${address}"
                }
            }`
}
