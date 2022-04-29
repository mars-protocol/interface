import { createStyles, Switch, withStyles } from '@material-ui/core'
import colors from '../styles/_assets.module.scss'

interface Props {
    switchCallback: (
        event: React.ChangeEvent<HTMLInputElement>,
        enabled: boolean
    ) => void
    checked: boolean
}

const CollateralSwitch = ({ switchCallback, checked }: Props) => {
    const CustomSwitch = withStyles(() =>
        createStyles({
            root: {
                width: 28,
                height: 16,
                padding: 0,
                display: 'flex',
            },
            switchBase: {
                padding: 2,
                color: colors.grey,
                '&$checked': {
                    transform: 'translateX(12px)',
                    color: colors.white,
                    '& + $track': {
                        opacity: 1,
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                    },
                },
            },
            thumb: {
                width: 12,
                height: 12,
                boxShadow: 'none',
            },
            track: {
                border: `1px solid ${colors.grey}`,
                borderRadius: 16 / 2,
                opacity: 1,
                backgroundColor: colors.white,
            },
            checked: {},
        })
    )(Switch)

    return <CustomSwitch checked={checked} onChange={switchCallback} />
}

export default CollateralSwitch
