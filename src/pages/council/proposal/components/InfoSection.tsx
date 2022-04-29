import { useState } from 'react'
import { Message } from '../../hooks/useProposals'
import ProposalMessage from '../../layouts/ProposalMessage'
import styles from './InfoSection.module.scss'
import MultilineContent from './MultilineContent'
import { useTranslation } from 'react-i18next'
import Button from '../../../../components/Button'

interface Props {
    title: string
    content: string
    messages: Message[]
}

const InfoSection = ({ title, content, messages }: Props) => {
    const { t } = useTranslation()
    const [expandView, setExpandView] = useState<boolean>()
    const [activeMessage, setActiveMessage] = useState(-1)

    // -------------------
    // CALLBACKS
    // -------------------
    const expandViewClickHandler = () => {
        setExpandView(!expandView)
    }

    const handleSetActiveMessage = (index: number) => {
        if (activeMessage === index) {
            setActiveMessage(-1)
        } else {
            setActiveMessage(index)
        }
    }
    return (
        <div className={styles.container}>
            <div className={styles.infoContainer}>
                <span className={`h4 ${styles.title}`}>{title}</span>
                <div
                    className={`${styles.contentWrapper} ${
                        expandView ? styles.expand : ''
                    }`}
                >
                    <div className={styles.content}>
                        <MultilineContent content={content} />
                    </div>
                    {expandView ? (
                        <div className={styles.proposalMessages}>
                            {messages.map((message, index) => {
                                return (
                                    <ProposalMessage
                                        key={index}
                                        active={activeMessage === index}
                                        id={index}
                                        targetContractAddress={
                                            message.msg.wasm.execute
                                                .contract_addr
                                        }
                                        msg={atob(message.msg.wasm.execute.msg)}
                                        setActive={() =>
                                            handleSetActiveMessage(index)
                                        }
                                        // None of these callbacks are required in readonly mode
                                        remove={(e) => () => {}}
                                        updateExecuteAddress={(e) => () => {}}
                                        updateExecuteMsg={(e) => () => {}}
                                        validateAddress={(value) => () => {}}
                                        validateMsg={(value) => () => {}}
                                        addressError={''}
                                        msgError={''}
                                        readonly={true}
                                    />
                                )
                            })}
                        </div>
                    ) : null}
                </div>
            </div>
            <div className={styles.showDetailsBtn}>
                <Button
                    text={
                        !expandView
                            ? t('council.readFullProposal')
                            : t('common.close')
                    }
                    onClick={expandViewClickHandler}
                    variant='transparent'
                    size='medium'
                />
            </div>
        </div>
    )
}

export default InfoSection
