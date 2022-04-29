import { StrategyProviders } from '../../constants/strategyProviders'
import Assets from '../assets/testnet'

const FieldsStrategies: FieldsStrategy[] = [
    {
        key: 'apolloAncBullStrategy',
        externalLink: 'https://app.apollo.farm/',
        minter: 'terra13r3vngakfw457dwhw9ef36mc8w6agggefe70d9',
        logo: Assets.ust.logo,
        borrow: Assets.ust.symbol,
        color: Assets.luna.color,
        astroportGenerator: 'terra1gjm7d9nmewn27qzrvqyhda8zsfl40aya7tvaw5',
        contract_addr: 'terra1lanxgewats337t49mnkaeh5g098j2g7e87k87s',
        lpToken: 'terra1agu2qllktlmf0jdkuhcheqtchnkppzrl4759y6',
        assets: [Assets.anc, Assets.ust],
        maxLeverage: 2.5,
        provider: StrategyProviders.APOLLO,
        apyQuery: {
            url: 'https://api.astroport.fi/graphql',
            query: `
                    apolloAncBullStrategy: pool(address:"terra1qr2k6yjjd5p2kaewqvg93ag74k6gyjr7re37fs") {
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
        key: 'lunaBullStrategy',
        minter: 'terra1e49fv4xm3c2znzpxmxs0z2z6y74xlwxspxt38s',
        logo: Assets.ust.logo,
        borrow: Assets.ust.symbol,
        color: Assets.luna.color,
        astroportGenerator: 'terra1gjm7d9nmewn27qzrvqyhda8zsfl40aya7tvaw5',
        contract_addr: 'terra1pkpgcqy38gyr978xfh9fx0ttq0jllzyfl05k4f',
        lpToken: 'terra1dqjpcqej9nxej80u0p56rhkrzlr6w8tp7txkmj',
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
        minter: 'terra13r3vngakfw457dwhw9ef36mc8w6agggefe70d9',
        logo: Assets.ust.logo,
        borrow: Assets.ust.symbol,
        color: Assets.anc.color,
        contract_addr: 'terra1x3tu0tgsa3wuz97w2nm29fvhnhjnag00nxsgmy',
        astroportGenerator: 'terra1gjm7d9nmewn27qzrvqyhda8zsfl40aya7tvaw5',
        lpToken: 'terra1agu2qllktlmf0jdkuhcheqtchnkppzrl4759y6',
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
        minter: 'terra1xrt4j56mkefvhnyqqd5pgk7pfxullnkvsje7wx',
        logo: Assets.ust.logo,
        borrow: Assets.ust.symbol,
        color: Assets.mir.color,
        contract_addr: 'terra1wrj7lrrxzdmcmpask6y48eudq7huvu8eylssjs',
        astroportGenerator: 'terra1gjm7d9nmewn27qzrvqyhda8zsfl40aya7tvaw5',
        lpToken: 'terra1efmcf22aweaj3zzjhzgyghv88dda0yk4j9jp29',
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
    {
        key: 'fakeMirStrat',
        minter: 'terra1408najmjzueu9ktg4rw7a8yge3z280d5yp9nay',
        logo: Assets.ust.logo,
        borrow: Assets.ust.symbol,
        color: Assets.fmir.color,
        contract_addr: 'terra16htwvqxqkygazqxmgt9wpqr0vtf6jekm6mf44n',
        astroportGenerator: 'terra1f7awhwwqcjkxlk83qvgzrpnnnzm7577u5ffsx7',
        lpToken: 'terra1r5q4cepddwn9sklkm4x0jhspv09w8rwsfszx5u',
        assets: [Assets.fmir, Assets.ust],
        maxLeverage: 2,
        provider: StrategyProviders.MARS,
        apyQuery: {
            url: 'https://api.astroport.fi/graphql',
            query: `
                    fakeMirStrat: pool(address:"terra1m6ywlgn6wrjuagcmmezzz2a029gtldhey5k552") {
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
        key: 'fancBullStrategy',
        minter: 'terra1q2kv38ldy03g8ql6l8vfhc0sf5a2ypur7ee50c',
        logo: Assets.ust.logo,
        borrow: Assets.ust.symbol,
        color: Assets.fanc.color,
        contract_addr: 'terra1gq03knyygm3v0fu2cvc3nptdhndl9cr4vekxkv',
        astroportGenerator: 'terra1f7awhwwqcjkxlk83qvgzrpnnnzm7577u5ffsx7',
        lpToken: 'terra1llys4hxu8wkt0msnm0nz328ymyrk3j3nz65rkx',
        assets: [Assets.fanc, Assets.ust],
        maxLeverage: 2,
        provider: StrategyProviders.MARS,
        apyQuery: {
            url: 'https://api.astroport.fi/graphql',
            query: `
                    fancBullStrategy: pool(address:"terra1qr2k6yjjd5p2kaewqvg93ag74k6gyjr7re37fs") {
                        trading_fees {
                            apr
                            apy
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
