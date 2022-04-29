import { StrategyProviders } from '../../constants/strategyProviders'
import Assets from '../assets/mainnet'

const FieldsStrategies: FieldsStrategy[] = [
    {
        key: 'lunaBullStrategy',
        name: 'LUNA-UST LP',
        description: 'LUNA-UST Bull Leveraged Yield Farm (Max 2x)',
        minter: 'terra1m6ywlgn6wrjuagcmmezzz2a029gtldhey5k552',
        logo: Assets.ust.logo,
        borrow: Assets.ust.symbol,
        color: Assets.luna.color,
        astroportGenerator: 'terra1zgrx9jjqrfye8swykfgmd6hpde60j0nszzupp9',
        contract_addr: 'terra1kztywx50wv38r58unxj9p6k3pgr2ux6w5x68md',
        lpToken: 'terra1m24f7k4g66gnh9f7uncp32p722v0kyt3q4l3u5',
        assets: [Assets.luna, Assets.ust],
        maxLeverage: 2,
        provider: StrategyProviders.MARS,
        apyQuery: {
            url: 'https://api.astroport.fi/graphql',
            query: `
                    lunaBullStrategy: pool(address:"terra1m6ywlgn6wrjuagcmmezzz2a029gtldhey5k552") {
                        trading_fees {
                            apy
                            apr
                        }
                        astro_rewards {
                            apy
                            apr
                        }
                        protocol_rewards {
                            apy
                            apr
                        }
                        total_rewards {
                            apy
                            apr
                        }
                    }`,
            target: ['pool', 'total_rewards', 'apy'],
            apr: true,
            absolute: false,
        },
    },
    {
        key: 'ancBullStrategy',
        name: 'ANC-UST LP',
        description: 'ANC-UST Bull Leveraged Yield Farm (Max 2x)',
        minter: 'terra1qr2k6yjjd5p2kaewqvg93ag74k6gyjr7re37fs',
        logo: Assets.ust.logo,
        borrow: Assets.ust.symbol,
        color: Assets.anc.color,
        contract_addr: 'terra1vapq79y9cqghqny7zt72g4qukndz282uvqwtz6',
        astroportGenerator: 'terra1zgrx9jjqrfye8swykfgmd6hpde60j0nszzupp9',
        lpToken: 'terra1wmaty65yt7mjw6fjfymkd9zsm6atsq82d9arcd',
        assets: [Assets.anc, Assets.ust],
        maxLeverage: 2,
        provider: StrategyProviders.MARS,
        apyQuery: {
            url: 'https://api.astroport.fi/graphql',
            query: `
                    ancBullStrategy: pool(address:"terra1qr2k6yjjd5p2kaewqvg93ag74k6gyjr7re37fs") {
                        trading_fees {
                            apy
                            apr
                        }
                        astro_rewards {
                            apy
                            apr
                        }
                        protocol_rewards {
                            apy
                            apr
                        }
                        total_rewards {
                            apy
                            apr
                        }
                    }`,
            target: ['pool', 'total_rewards', 'apy'],
            apr: true,
            absolute: false,
        },
    },
    {
        key: 'mirBullStrategy',
        name: 'MIR-UST LP',
        description: 'MIR-UST Bull Leveraged Yield Farm (Max 2x)',
        minter: 'terra143xxfw5xf62d5m32k3t4eu9s82ccw80lcprzl9',
        logo: Assets.ust.logo,
        borrow: Assets.ust.symbol,
        color: Assets.mir.color,
        contract_addr: 'terra12dq4wmfcsnz6ycep6ek4umtuaj6luhfp256hyu',
        astroportGenerator: 'terra1zgrx9jjqrfye8swykfgmd6hpde60j0nszzupp9',
        lpToken: 'terra17trxzqjetl0q6xxep0s2w743dhw2cay0x47puc',
        assets: [Assets.mir, Assets.ust],
        maxLeverage: 2,
        provider: StrategyProviders.MARS,
        apyQuery: {
            url: 'https://api.astroport.fi/graphql',
            query: `
                    mirBullStrategy: pool(address:"terra143xxfw5xf62d5m32k3t4eu9s82ccw80lcprzl9") {
                        trading_fees {
                            apy
                            apr
                        }
                        astro_rewards {
                            apy
                            apr
                        }
                        protocol_rewards {
                            apy
                            apr
                        }
                        total_rewards {
                            apy
                            apr
                        }
                    }`,
            target: ['pool', 'total_rewards', 'apy'],
            apr: true,
            absolute: false,
        },
    },
]

export default FieldsStrategies
