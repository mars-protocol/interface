# Mars Protocol Osmosis Outpost Frontend

![mars-banner-1200w](https://marsprotocol.io/banner.png)

## Web App

This project is a [NextJS](https://nextjs.org/). React application.

The project utilises [React hooks](https://reactjs.org/docs/hooks-intro.html), functional components, Zustand for state management, and useQuery for general data fetching and management.

Typescript is added and utilised (but optional if you want to create .jsx or .tsx files).

SCSS with [CSS modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet) (webpack allows importing css files into javascript, use the CSS module technique to avoid className clashes).

Sentry is used for front end error logging/exception & bug reporting.

## Deployment

Start web server

```bash
yarn && yarn dev
```

### Contributing

We welcome and encourage contributions! Please create a pull request with as much information about the work you did and what your motivation/intention was.

## Imports

Local components are imported via index files, which can be automatically generated with `yarn index`. This command targets index.ts files with a specific pattern in order to automate component exports. This results in clean imports throughout the pages:

```
import { Button, Card, Titlte } from 'components/common'
```

or

```
import { Breakdown, RepayInput } from 'components/fields'
```

In order for this to work, components are place in a folder with UpperCamelCase with the respective Component.tsx file. The component cannot be exported at default, so rather export the `const` instead.

## License

Contents of this repository are open source under the [Mars Protocol Web Application License Agreement](./LICENSE).
