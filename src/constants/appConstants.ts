/* terra:network */
export const FINDER_URL = 'https://terrascope.info/'
export const EXTENSION = 'https://terra.money/extension'
export const CHROME = 'https://google.com/chrome'
export const ASTROPORT_URL = 'https://app.astroport.fi/swap'
export const FORUM_URL = 'https://forum.marsprotocol.io/'

/* contract deploy block heights */
export const STAKING_CONTRACT_DEPLOY_HEIGHT = 6531019
export const MARS_CONTRACT_DEPLOY_HEIGHT = 6530880
export const XMARS_CONTRACT_DEPLOY_HEIGHT = 6531023
export const AUCTION_CONTRACT_END_TIMESTAMP = 1646046000 + 432000 + 172800 // init_timestamp + ust_deposit_window + withdrawal_window
export const AUCTION_LP_TOKENS_VESTING_DURATION =
    AUCTION_CONTRACT_END_TIMESTAMP + 7776000 // lp_tokens_vesting_duration

/* mars:unit */
export const MARS_DENOM = 'MARS'
export const MARS_DECIMALS = 6
export const XMARS_DENOM = 'XMARS'
export const XMARS_DECIMALS = 6
export const ASTRO_DENOM = 'ASTRO'
export const ASTRO_DECIMALS = 6
export const PROPOSAL_LIMIT = 5
export const UST_DENOM = 'uusd'
export const UST_DECIMALS = 6

export const BLOCK_TIME = 7500
export const BLOCKS_PER_DAY = (86400 * 1000) / BLOCK_TIME
export const COOLDOWN_BUFFER = BLOCK_TIME * 2

/* borrowLimit */
export const GAUGE_SCALE = 0.825
export const DEFAULT_SLIPPAGE = 0.01

/* other */
export const VOLATILITY_THRESHOLD = 0.05

/* feature flags */
export const FIELDS_FEATURE: Boolean = true
export const MY_LOCKDROP_FEATURE: Boolean = true
export const PROPOSAL_ACTION_BUTTONS_FEATURE: Boolean = false
export const AIRDROP_CLAIM_FEATURE: Boolean = true
