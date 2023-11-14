import { ChainInfoID } from 'types/enums/wallet'

/* asset:unit */
export const MARS_SYMBOL = 'MARS'
export const MARS_DECIMALS = 6

/* borrow capacity */
export const DEFAULT_SLIPPAGE = 0.01

/* other */
export const FEE_EST_AMOUNT = '1'
export const SESSION_WALLET_KEY = 'shuttle'
export const SWAP_THRESHOLD = 10
export const VAULT_DEPOSIT_BUFFER = 0.99
export const GAS_ADJUSTMENT = 1.3

export const ITEM_LIMIT_PER_QUERY = 10

/* fields query keys */
export const CONFIG = 'config'
export const STATE = 'state'
export const POSITION = 'position'
export const HEALTH = 'health'
export const POOL = 'pool'
export const SNAPSHOT = 'snapshot'
export const LP_DEPOSIT = 'lpdeposit'
export const UNCOLLATERISED_LOAN_LIMIT = 'uncollaterisedLoanLimit'
export const STRATEGY_CURRENT_DEBT = 'strategyTotalDebt'

/* local storage keys */
export const UNLOCK_DISCLAIMER_KEY = 'hideUnlockDisclaimer'
export const FIELDS_TUTORIAL_KEY = 'fieldsHideTutorial'
export const RED_BANK_TUTORIAL_KEY = 'redbankHideTutorial'
export const DISPLAY_CURRENCY_KEY = 'displayCurrency'
export const ENABLE_ANIMATIONS_KEY = 'enableAnimations'
export const CHAIN_ID_KEY = 'currentChainId'
export const TERMS_OF_SERVICE = 'termsOfService'

/* chains */
export const SUPPORTED_CHAINS: { chainId: ChainInfoID; type: 'testnet' | 'mainnet' }[] = [
  { chainId: ChainInfoID.Osmosis1, type: 'mainnet' },
  { chainId: ChainInfoID.Neutron1, type: 'mainnet' },
  { chainId: ChainInfoID.OsmosisDevnet, type: 'testnet' },
  { chainId: ChainInfoID.NeutronTestnet, type: 'testnet' },
]
