import { ReactNode, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FINDER_URL } from '../../../../constants/appConstants'
import InfoCard from '../../components/InfoCard'

import styles from './Details.module.scss'
import { TippyProps } from '@tippyjs/react'
import { EllipsisSVG, TwitterSVG } from '../../../../components/Svg'
import { useTranslation } from 'react-i18next'
import { truncate } from '../../../../libs/text'
import { PROPOSAL_ACTION_BUTTONS_FEATURE } from '../../../../constants/appConstants'
import useStore from '../../../../store'
import Button from '../../../../components/Button'

export const DefaultTippyProps: TippyProps = {
    animation: false,
    interactive: true,
    appendTo: document.body,
}

export const DropdownTippyProps: TippyProps = {
    ...DefaultTippyProps,
    placement: 'bottom-end',
}

interface Props {
    endDate: ReactNode
    creator: string
    discussionLink: string
    // following callbacks are for testing purposes behind a feature flag, should be disabled on release.
    handleEndProposal: () => void
    handleExecuteProposal: () => void
}

const Details = ({
    endDate,
    creator,
    discussionLink,
    handleEndProposal,
    handleExecuteProposal,
}: Props) => {
    const { t } = useTranslation()
    const [visible, setVisible] = useState(false)
    const show = () => setVisible(true)
    const hide = () => setVisible(false)

    const chainID = useStore((s) => s.networkConfig?.chainID)
    const location = useLocation()
    const shareProposalClickHandler = () => {
        window.open(
            `https://twitter.com/share?url=https://marsprotocol.io/%23${location.pathname}`,
            '_blank'
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.item}>
                <InfoCard
                    titleText={`${t('council.voteEnds')}:`}
                    detailsText={endDate}
                />
            </div>
            <div className={styles.item}>
                <InfoCard
                    titleText={`${t('council.creator')}:`}
                    detailsText={truncate(creator)}
                    link={`${FINDER_URL}/${chainID}/address/${creator}`}
                />
            </div>
            <div className={styles.item}>
                <div className={styles.buttons}>
                    <Button
                        text={t('council.discussProposal')}
                        color='tertiary'
                        onClick={() => {
                            if (!discussionLink) return
                            window.open(discussionLink, '_blank')
                        }}
                        styleOverride={{ marginRight: '8px' }}
                    />
                    <Button
                        text={
                            <span className={styles.share}>
                                <TwitterSVG />
                            </span>
                        }
                        onClick={shareProposalClickHandler}
                        color='tertiary'
                        variant='round'
                    />
                    <div className={styles.dropdownWrapper}>
                        {PROPOSAL_ACTION_BUTTONS_FEATURE ? (
                            <Button
                                prefix={<EllipsisSVG />}
                                onClick={visible ? hide : show}
                                color='tertiary'
                                styleOverride={{ marginLeft: '8px' }}
                                variant='round'
                            />
                        ) : null}
                        {visible && (
                            <div className={styles.dropdownContainer}>
                                <Button
                                    text={t('council.endProposal')}
                                    onClick={handleEndProposal}
                                    color='tertiary'
                                    variant='transparent'
                                    styleOverride={{
                                        padding: '8px',
                                    }}
                                />
                                <Button
                                    text={t('council.executeProposal')}
                                    onClick={handleExecuteProposal}
                                    variant='transparent'
                                    color='tertiary'
                                    styleOverride={{
                                        padding: '8px',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Details
