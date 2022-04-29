import { NavLink } from 'react-router-dom'
import Connect from './Connect'
import styles from './Header.module.scss'
import { BurgerMenuSVG } from '../components/Svg'
import i18next from 'i18next'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import IncentivesButton from '../components/header/IncentivesButton'
import { useLocation } from 'react-router-dom'
import { FIELDS_FEATURE } from '../constants/appConstants'

const Header = () => {
    const { t } = useTranslation()
    const location = useLocation()

    useEffect(() => {
        const currentLanguage = i18next.language || 'en'
        const lang = currentLanguage.substring(0, 2)
        document.body.dir = i18next.dir(lang)
    }, [])

    const handleChange = (target: string) => {
        window.location.href = `#${target}`
    }

    const getRouteFromPathName = (pathName: string): string => {
        if ((pathName.match(/\//g) || []).length <= 1) return pathName

        const firstIndex = pathName.indexOf('/')
        const secondIndex = pathName.indexOf('/', firstIndex + 1)
        const route = pathName.substring(firstIndex, secondIndex)

        return route
    }

    return (
        <header className={styles.header}>
            <div className={styles.navBar}>
                <div className='no-small'>
                    <NavLink
                        className='nav'
                        activeClassName={styles.active}
                        to={'/redbank'}
                    >
                        {t('global.redBank')}
                    </NavLink>
                </div>
                <div className='no-small'>
                    <NavLink
                        className='nav'
                        activeClassName={styles.active}
                        to={'/mystation'}
                    >
                        {t('global.myStation')}
                    </NavLink>
                </div>
                {FIELDS_FEATURE ? (
                    <div className='no-small'>
                        <NavLink
                            className='nav'
                            activeClassName={styles.active}
                            to={'/fields'}
                        >
                            {t('global.fields')}
                        </NavLink>
                    </div>
                ) : (
                    <div className='no-small nav'>
                        <div className={styles.disabled}>
                            {t('global.fields')}
                        </div>
                    </div>
                )}

                <div className='no-small'>
                    <NavLink
                        className='nav'
                        activeClassName={styles.active}
                        to={'/council'}
                    >
                        {t('global.council')}
                    </NavLink>
                </div>
            </div>
            <div className={styles.connector}>
                <IncentivesButton />
                <div>
                    <Connect />
                </div>
            </div>
            <div className={styles.mobileMenu}>
                <BurgerMenuSVG />
                <select
                    className='nav'
                    onChange={(e) => handleChange(e.target.value)}
                    defaultValue={
                        location.pathname === '/'
                            ? '/redbank'
                            : (location.pathname.match(/\//g) || []).length > 1
                            ? getRouteFromPathName(location.pathname)
                            : location.pathname
                    }
                >
                    <option value={'/redbank'}>{t('global.redBank')}</option>
                    <option value={'/mystation'}>
                        {t('global.myStation')}
                    </option>
                    <option disabled={!FIELDS_FEATURE} value={'/fields'}>
                        {t('global.fields')}
                    </option>
                    <option value={'/council'}>{t('global.council')}</option>
                </select>
            </div>
        </header>
    )
}

export default Header
