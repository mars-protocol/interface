import Button from '../../../components/Button'
import { useMarsBalance } from '../../../hooks/useMarsBalance'
import { MARS_DENOM } from '../../../constants/appConstants'

import styles from './Apy.module.scss'
import { useTranslation } from 'react-i18next'
import { useCooldown } from '../hooks/useCooldown'
import moment from 'moment'
import { formatValue } from '../../../libs/parse'

interface Props {
    stakeClick: () => void
    unstakeClick: () => void
    showUnstakeButton: boolean
    apy: number
}

const Apy = ({ stakeClick, unstakeClick, showUnstakeButton, apy }: Props) => {
    const { t } = useTranslation()
    const { findBalance } = useMarsBalance()
    const { claim } = useCooldown()
    const marsBalance = Number(findBalance(MARS_DENOM)?.amount || 0)

    return (
        <div className={styles.container}>
            <span className={`h2 ${styles.apy}`}>
                {formatValue(
                    apy < 0.01 ? 0.01 : apy,
                    2,
                    2,
                    true,
                    apy < 0.01 ? '< ' : false,
                    '%'
                )}
            </span>
            <span className={`sub2 ${styles.apyTitle}`}>{t('common.apy')}</span>
            <div className={styles.stake}>
                <Button
                    text={t('council.stakeMars')}
                    disabled={!marsBalance}
                    color='primary'
                    onClick={stakeClick}
                />
                {showUnstakeButton ? (
                    <Button
                        text={
                            claim &&
                            moment(
                                claim.cooldown_end_timestamp * 1000
                            ).isAfter()
                                ? t('fields.showCooldown')
                                : t('council.unstakeMars')
                        }
                        styleOverride={{ marginLeft: '8px' }}
                        color='primary'
                        onClick={unstakeClick}
                    />
                ) : null}
            </div>
        </div>
    )
}

export default Apy
