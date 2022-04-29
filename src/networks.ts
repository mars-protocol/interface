import { NetworkInfo } from '@terra-dev/wallet-types'
type MarsNetworkInfo = NetworkInfo & LocalNetworkConfig

const networks: Record<string, MarsNetworkInfo> = {
    mainnet: {
        name: 'mainnet',
        chainID: 'columbus-5',
        lcd: 'https://lcd.terra.dev',
        fcd: 'https://fcd.terra.dev',
        mantle: 'https://hive.terra.dev/graphql',
        // Math.random() > 0.5
        //     ? 'https://hive.terra.dev/graphql'
        //     : 'https://terra-hive.daic.capital/graphql',
        gasPriceURL: 'https://fcd.terra.dev/v1/txs/gas_prices',
        airdropWebServiceURL:
            'https://5ico3t1n1e.execute-api.us-east-2.amazonaws.com/latest/users',
        privateLcd: 'https://lcd-terra.everstake.one',
    },
    testnet: {
        name: 'testnet',
        chainID: 'bombay-12',
        lcd: 'https://bombay-lcd.terra.dev',
        fcd: 'https://bombay-fcd.terra.dev',
        mantle: 'https://testnet-hive.terra.dev/graphql',
        gasPriceURL: 'https://bombay-fcd.terra.dev/v1/txs/gas_prices',
        airdropWebServiceURL:
            'https://vv22bbm01e.execute-api.us-east-2.amazonaws.com/latest/users',
        privateLcd: 'https://lcd-terra-test.everstake.one',
    },
    localterra: {
        name: 'localterra',
        chainID: 'localterra',
        lcd: 'http://localhost:1317',
        fcd: 'http://localhost:1317',
        mantle: 'https://testnet-hive.terra.dev/graphql',
        gasPriceURL: 'https://bombay-fcd.terra.dev/v1/txs/gas_prices',
        airdropWebServiceURL:
            'https://vv22bbm01e.execute-api.us-east-2.amazonaws.com/latest/users',
        privateLcd: 'https://lcd-terra-test.everstake.one',
    },
}

export default networks
