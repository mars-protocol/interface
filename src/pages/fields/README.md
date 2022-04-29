# Leverage Yield Farming Strategy Configuration

This is a short guide on adding leverage yield farming strategies to the mars front end

## Prerequisites

-   Strategy deployed to relevant chain (e.g testnet/mainnet).
-   For strategies to function, they must have a credit line(s) for the asset(s) they want to borrow. Credit lines can be obtained via the Martian Council.
-   A graphQL server to return apy information for the pool the strategy provides liquidity to.

## Steps

-   Add asset config to relevant network [assets](https://github.com/mars-protocol/web-app/blob/master/src/configs/assets/testnet.ts) config file. Ensure configuration for all required assets exists. For instance if the strategy you are adding is Luna-ust, you will need both LUNA and UST defined
    #### Example:
    ```
    luna: {
            symbol: 'LUNA',
            name: 'Terra',
            logo: luna,
            denom: 'uluna',
            maToken: 'maluna',
            color: colors.luna,
            native: true,
            decimals: 6,
        },
    ```
-   Add configuration for specific strategy to the correct network [config](https://github.com/mars-protocol/web-app/blob/master/src/configs/fields/testnet.ts).

    #### Example config

    ```
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
        apyQuery: {
            url: 'https://api.astroport.fi/graphql',
            query: `
                    // ensure query name is same as key
                    lunaBullStrategy: pool (address:"terra1m6ywlgn6wrjuagcmmezzz2a029gtldhey5k552") {
                        astro_rewards {
                            apy
                        }
                        protocol_rewards {
                            apy
                        }
                        total_rewards {
                            apy
                        }
                    }`,
            target: ['pool', 'total_rewards', 'apy'],
            apr: false,
            absolute: false,
        },
    },

    ```

    `key` - This is a unique key to identify the strategy (string)

    `minter` - The minter is the minter of LP shares token for the liquidity pool that the strategy is providing liquidity to. (string)

    `logo` - Reference to the asset logo (Asset.logo)

    `borrow` - The symbol of the secondary asset (Asset.symbol)

    `color` - Can be any color, but reccomend using a color similar to the asset primary color. Is used to identify the strategy in visuals throughout the app. (Asset.color)

    `astroport_generator` - Astro generator to stake LP tokens in

    `contract_addr` - The address of the deployed strategy (string)

    `lp_token` - The Lp token from the astroport pair

    `assets` - Primary and secondary assets (array)

    `apyQuery` - This is an object used to fetch apy information from the pool that the strategy provides liquidity too. This consists of two parameters

    -   `url` This is the url of the graphql server. Generally this will be 'https://api.astroport.fi/graphql' (string)
    -   `query` The query to be passed to the graphql server. If using an astroport server, ensure you select the correct pool address. **Note that query name should be the same as the key for this strategy**
