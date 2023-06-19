# Mars Protocol Osmosis Outpost Frontend

![mars-banner-1200w](https://marsprotocol.io/banner.png)

## 1. Web App

This project is a [NextJS](https://nextjs.org/). React application.

The project utilises [React hooks](https://reactjs.org/docs/hooks-intro.html), functional components, [Zustand](https://github.com/pmndrs/zustand) for state management, and [useQuery](https://github.com/TanStack/query) for general data fetching and management.

Typescript is added and utilised (but optional if you want to create .jsx or .tsx files).

SCSS with [CSS modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet) (webpack allows importing css files into javascript, use the CSS module technique to avoid className clashes).

## 2. Deployment

Start web server

```bash
yarn && yarn dev
```

### 2.1 Custom node endpoints using non-Docker deployments

Copy `.env.example` to `.env` and modify the values to suit your needs.

### 2.2 Custom node endpoints using Docker

We allow the use of environment variables to be passed to the Docker container to specify custom endpoints for the app. The variables are:


|Variable|Description|Default|
|--------|-----------|-------|
|URL_OSMOSIS_GQL|The Osmosis Hive GraphQL endpoint to use|https://osmosis-node.marsprotocol.io/GGSFGSFGFG34/osmosis-hive-front/graphql|
|URL_OSMOSIS_REST|The Osmosis node REST endpoint to use|https://lcd-osmosis.blockapsis.com|
|URL_OSMOSIS_RPC|The Osmosis node RPC endpoint to use|https://rpc-osmosis.blockapsis.com|
|URL_OSMOSIS_TEST_GQL|The Osmosis Testnet Hive GraphQL endpoint to use|https://testnet-osmosis-node.marsprotocol.io/XF32UOOU55CX/osmosis-hive-front/graphql|
|URL_OSMOSIS_TEST_REST|The Osmosis Testnet node REST endpoint to use|https://lcd.osmotest5.osmosis.zone|
|URL_OSMOSIS_TEST_RPC|The Osmosis Testnet node RPC endpoint to use|https://rpc.osmotest5.osmosis.zone|
|URL_NEUTRON_TEST_GQL|The Neutron Testnet Hive GraphQL endpoint to use|https://testnet-neutron-gql.marsprotocol.io/graphql|
|URL_NEUTRON_TEST_REST|The Neutron Testnet node REST endpoint to use|https://rest-palvus.pion-1.ntrn.tech|
|URL_NEUTRON_TEST_RPC|The Neutron Testnet node RPC endpoint to use|https://rpc-palvus.pion-1.ntrn.tech|

**Sample Docker run command**

This command will start the container in interactive mode with port 3000 bound to localhost and print logs to stdout.

```sh
docker run -it -p 3000:3000 \
      -e NETWORK=mainnet \
      -e URL_OSMOSIS_GQL=https://your-osmosis-hive-endpoint.com \
      -e URL_OSMOSIS_REST=https://your-osmosis-rest-endpoint.com \
      -e URL_OSMOSIS_RPC=https://your-osmosis-rpc-endpoint.com \
      -e URL_OSMOSIS_TEST_GQL=https://your-osmosis-testnet-hive-endpoint.com \
      -e URL_OSMOSIS_TEST_REST=https://your-osmosis-testnet-rest-endpoint.com \
      -e URL_OSMOSIS_TEST_RPC=https://your-osmosis-testnet-rpc-endpoint.com \
      -e URL_NEUTRON_TEST_GQL=https://your-neutron-testnet-hive-endpoint.com \
      -e URL_NEUTRON_TEST_REST=https://your-neutron-testnet-rest-endpoint.com \
      -e URL_NEUTRON_TEST_RPC=https://your-neutron-testnet-rpc-endpoint.com marsprotocol/interface:latest 
```

## 3. Text and translations

This repository makes use of a [translation repository](https://github.com/mars-protocol/translations). This repository containes all of the translation key values that are used within the UI. The rationale is to have no _hardcoded_ display string values in this repository.

## 4. Development practices

### 4.1 Imports

Local components are imported via index files, which can be automatically generated with `yarn index`. This command targets index.ts files with a specific pattern in order to automate component exports. This results in clean imports throughout the pages:

```
import { Button, Card, Title } from 'components/common'
```

or

```
import { Breakdown, RepayInput } from 'components/fields'
```

In order for this to work, components are place in a folder with UpperCamelCase with the respective Component.tsx file. The component cannot be exported at default, so rather export the `const` instead.

### 4.2 Data orchestration

Data is handled with a combination of container components, useQuery and Zustand. Container components are responsible for syncing the application state with the wallet-provider state. This fire of the required queries in useQuery, which are for many cases also stored in Zustand.

We aim to have as much as possible available in Zustand, to have one source of truth.

## 5. Contributing

We welcome and encourage contributions! Please create a pull request with as much information about the work you did and what your motivation/intention was.

## 6. License

Contents of this repository are open source under the [Mars Protocol Web Application License Agreement](./LICENSE).
