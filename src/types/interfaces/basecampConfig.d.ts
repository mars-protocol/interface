interface BasecampConfig {
  // Contract that holds all other contract addresses in the Mars design
  address_provider_address: string
  // Blocks during which a proposal is active since being submitted
  proposal_voting_period: number
  // Blocks that need to pass since a proposal succeeds in order for it to be available to be executed
  proposal_effective_delay: number
  // Blocks after the effective_delay during which a successful proposal can be activated before it expires
  proposal_expiration_period: number
  // Number of Mars needed to make a proposal. Will be returned if successful. Will be
  // distributed between stakers if proposal is not executed.
  proposal_required_deposit: number
  // % of total voting power required to participate in the proposal in order to consider it successful
  proposal_required_quorum: string // Decimal
  // % of for votes required in order to consider the proposal successful
  proposal_required_threshold: string // Decimal
}
