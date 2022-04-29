import { useHistory, useLocation } from 'react-router'
import { GridActionType } from '../components/grid/GridActions'
import { getRoute } from '../libs/parse'
import { ActionType } from '../types/enums'

const useActionButtonClickHandler = () => {
    const history = useHistory()
    const location = useLocation()

    return (
        action: ActionType,
        denom: string,
        gridAction: GridActionType,
        url: string
    ) => {
        return gridAction !== GridActionType.None
            ? () => {
                  history.push(
                      `${location.pathname}/${getRoute(gridAction)}/${denom}`
                  )
              }
            : action === ActionType.ExternalLink
            ? () => {
                  window.open(url, '_blank')
              }
            : () => {
                  alert(`open external link with url : ${url}`)
              }
    }
}

export default useActionButtonClickHandler
