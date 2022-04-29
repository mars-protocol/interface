import i18n from 'i18next'
import { useEffect, useState } from 'react'

import styles from './LanguageSelect.module.scss'

const LanguageSelect = () => {
    const [currentLanguage, setCurrentLanguage] = useState('en')

    useEffect(
        () => {
            const lang = i18n.language.substring(0, 2) || 'en'
            if (currentLanguage !== lang) {
                setCurrentLanguage(lang)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [i18n.language, currentLanguage]
    )

    const changeLanguage = (lng: string) => {
        setCurrentLanguage(lng)
        i18n.changeLanguage(lng)
    }

    return (
        <div className={styles.selectWrapper}>
            <select
                className={styles.select}
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
            >
                <option value='de'>Deutsch</option>
                <option value='en'>English</option>
            </select>
        </div>
    )
}

export default LanguageSelect
