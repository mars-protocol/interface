import { GridActionType } from '../components/grid/GridActions'

interface MenuDisplayProps {
    displayName?: string
    icon?: SVGIcon
}

interface ActionButtonProps {
    actionIcon: SVGIcon
    marginRight?: string
    clickHandler: () => void
    disabled?: boolean
}

interface MenuItem {
    attrs: { key: string; to: string; displayProps: MenuDisplayProps }
}

interface ButtonStyleOverride {
    display?: string
    position?: 'relative' | 'absolute' | 'fixed'
    justifyContent?: string
    top?: string
    right?: string
    left?: string
    bottom?: string
    fontSize?: string
    marginLeft?: string
    marginRight?: string
    marginTop?: string
    marginBottom?: string
    padding?: string
    borderRadius?: string
    textTransform?: TextTransform
    backgroundImage?: string
    fontFamily?: string
    letterSpacing?: string
    backgroundColor?: string
    alignSelf?: string
    width?: string
    opacity?: string
    height?: string
}

interface Modal {
    asContent?: boolean
    isOpen: boolean
    close: () => void
}

interface ActionModal extends Modal {
    symbol: string
    denom: string
    strategy: StrategyObject | undefined
    cw20ContractAddress: string
    activeView: ViewTypes
    setView: (viewType: ViewTypes) => void
    open: (denom: string, viewType: ViewTypes) => void
    openStrategy: (strategy: StrategyObject, viewType: ViewTypes) => void
}

interface DropdownItemProps {
    icon: SVGIcon
    title: string
    denom: string
    actionType: ActionType
    gridAction: GridActionType
    url: string
    close: () => void
    strategy?: StrategyObject
}
