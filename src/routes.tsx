import { Switch, Route, RouteProps, Redirect } from 'react-router-dom'
import { Dictionary } from 'ramda'

import Redbank from './pages/redbank/Redbank'
import MyStation from './pages/mystation/MyStation'
import Council from './pages/council/Council'
import Fields from './pages/fields/Fields'
import { FIELDS_FEATURE } from './constants/appConstants'

export enum MenuKey {
    MARKETS = 'markets',
    REDBANK = 'RedBank',
    MYSTATION = 'MyStation',
    LANDINGPAD = 'LandingPad',
    COUNCIL = 'Council',
    PROPOSAL = 'Proposal',
    FIELDS = 'Fields',
    STAKE = 'Stake',
    UNSTAKE = 'Unstake',
    DEPOSIT = 'Deposit',
    WITHDRAW = 'Withdraw',
    BORROW = 'Borrow',
    REPAY = 'Repay',
}

let menu: Dictionary<RouteProps> = {
    [MenuKey.REDBANK]: { path: '/redbank', exact: false, component: Redbank },
    [MenuKey.MYSTATION]: {
        path: '/mystation',
        exact: false,
        component: MyStation,
    },
    [MenuKey.COUNCIL]: { path: '/council', exact: false, component: Council },
}

if (FIELDS_FEATURE) {
    menu[MenuKey.FIELDS] = { path: '/fields', exact: false, component: Fields }
}

const routes = (routes: Dictionary<RouteProps> = menu, path: string = '') => (
    <Switch>
        {Object.entries(routes).map(([key, route]) => (
            <Route {...route} path={path + route.path} key={key} />
        ))}
        <Redirect to='/redbank' />
    </Switch>
)

export default routes
