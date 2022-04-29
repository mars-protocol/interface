import mars from '../images/MARS-COLORED.svg'
import apollo from '../images/Apollo.svg'

import { StrategyProvider } from '../types/interfaces/strategyProvider'

export const StrategyProviders: StrategyProvider = {
    MARS: {
        logo: mars,
        name: 'Mars',
    },
    APOLLO: {
        logo: apollo,
        name: 'Apollo',
    },
}
