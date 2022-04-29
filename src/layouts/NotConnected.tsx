import MyStationNotConnected from '../pages/mystation/layouts/NotConnected'
import RedbankNotConnected from '../pages/redbank/layouts/NotConnected'
import { Route, Switch } from 'react-router-dom'

const NotConnected = () => {
    return (
        <Switch>
            <Route path='/mystation'>
                <MyStationNotConnected />
            </Route>
            <Route path='/*'>
                <RedbankNotConnected />
            </Route>
        </Switch>
    )
}

export default NotConnected
